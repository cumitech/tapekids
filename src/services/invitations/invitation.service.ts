import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_BATCH_STATUSES,
  INVITATION_STATUSES,
} from "@/constants/event-participation";
import type { InvitationBatch } from "@/data/entities/invitation-batch";
import { parseCreateInvitationBatch } from "@/data/dtos/invitation-batch.dto";
import { parseAcceptInvitation, parseNewInvitePassword } from "@/data/dtos/invitation.dto";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { InvitationBatchRepository } from "@/data/repositories/invitation-batch.repository";
import { InvitationRepository } from "@/data/repositories/invitation.repository";
import { MailingListMemberRepository } from "@/data/repositories/mailing-list-member.repository";
import { MailingListRepository } from "@/data/repositories/mailing-list.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid, tokenId } from "@/lib/api/id";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { translationsFromInput } from "@/lib/content-i18n/input";
import { isEmptyHtml } from "@/lib/html";
import { isMailConfigured } from "@/lib/integrations/env";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { eventService } from "@/services/events/event.service";
import { authService } from "@/services/auth/auth.service";
import { auditService } from "@/services/audit/audit.service";
import { notificationService } from "@/services/notifications/notification.service";

const invitationBatchRepository = new InvitationBatchRepository();
const invitationRepository = new InvitationRepository();
const mailingListRepository = new MailingListRepository();
const mailingListMemberRepository = new MailingListMemberRepository();
const personRepository = new PersonRepository();
const eventMembershipRepository = new EventMembershipRepository();

export class InvitationService {
  async listByEvent(eventId: string, query: ListQuery) {
    const result = await invitationBatchRepository.listByEvent(eventId, query);
    return {
      ...result,
      data: await contentTranslationRepository.localize(
        CONTENT_ENTITY_TYPES.invitationBatch,
        result.data,
        resolveContentLocale()
      ),
    };
  }

  async getBatch(id: string) {
    const batch = await invitationBatchRepository.findById(id);
    const [localized] = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.invitationBatch,
      [batch],
      resolveContentLocale(),
      true
    );
    const invitations = await invitationRepository.listByBatch(id);
    return { batch: localized, invitations };
  }

  async queue(eventId: string, body: unknown, sentById: string) {
    await eventService.getById(eventId);
    const input = parseCreateInvitationBatch(body);
    const kind = input.kind ?? EVENT_MEMBERSHIP_KINDS.CAMPER;
    const subject =
      input.translations?.[DEFAULT_LOCALE]?.subject?.trim() || input.subject || "";
    const bodyText = sanitizeRichText(
      input.translations?.[DEFAULT_LOCALE]?.body?.trim() || input.body || ""
    );
    if (!subject || isEmptyHtml(bodyText)) {
      throw new ValidationException("Subject and message are required.");
    }
    if (input.translations?.en?.body) {
      input.translations.en.body = sanitizeRichText(input.translations.en.body);
    }
    if (input.translations?.fr?.body) {
      input.translations.fr.body = sanitizeRichText(input.translations.fr.body);
    }

    const personIds = new Set(input.personIds ?? []);

    if (input.mailingListId) {
      await mailingListRepository.findById(input.mailingListId);
      const fromList = await mailingListMemberRepository.listPersonIds(
        input.mailingListId
      );
      for (const id of fromList) {
        personIds.add(id);
      }
    }

    if (personIds.size === 0) {
      throw new ValidationException(
        "No recipients to invite. Add people to the mailing list or pass person ids."
      );
    }

    const people = await personRepository.findByIds(Array.from(personIds));
    if (people.length !== personIds.size) {
      throw new ValidationException("One or more people were not found.");
    }

    const batch = await invitationBatchRepository.create({
      id: nanoid(),
      eventId,
      mailingListId: input.mailingListId ?? null,
      kind,
      subject,
      body: bodyText,
      sentById,
      status: INVITATION_BATCH_STATUSES.DRAFT,
      sentAt: null,
    });

    await contentTranslationRepository.replace(
      CONTENT_ENTITY_TYPES.invitationBatch,
      batch.id,
      translationsFromInput(CONTENT_ENTITY_TYPES.invitationBatch, input, {
        subject,
        body: bodyText,
      })
    );

    await invitationRepository.createMany(
      people.map((person) => ({
        id: nanoid(),
        batchId: batch.id,
        eventId,
        personId: person.id,
        kind,
        token: tokenId(),
        emailSnapshot: person.email,
        status: INVITATION_STATUSES.QUEUED,
        sentAt: null,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }))
    );

    for (const person of people) {
      await eventMembershipRepository.upsertInvited(eventId, person.id, kind);
    }

    if (isMailConfigured()) {
      return this.sendBatch(batch.id);
    }

    const invitations = await invitationRepository.listByBatch(batch.id);
    return {
      batch,
      invitations,
      queuedCount: invitations.length,
      failedCount: 0,
    };
  }

  async sendBatch(id: string) {
    if (!isMailConfigured()) {
      throw new ValidationException("Mail is not configured.");
    }

    const event = await eventService.getById(
      (await invitationBatchRepository.findById(id)).eventId
    );
    const rawBatch = await invitationBatchRepository.updateStatus(
      id,
      INVITATION_BATCH_STATUSES.SENDING
    );
    const copies = await this.localizedBatchCopies(rawBatch);
    const primary = copies[DEFAULT_LOCALE];
    const invitations = await invitationRepository.listByBatch(id);
    let failed = 0;

    for (const invitation of invitations) {
      if (
        invitation.status === INVITATION_STATUSES.SENT ||
        invitation.status === INVITATION_STATUSES.ACCEPTED
      ) {
        continue;
      }

      const person = invitation.person;
      const to = invitation.emailSnapshot || person?.email;
      if (!to) {
        await invitationRepository.markFailed(invitation.id);
        failed += 1;
        continue;
      }

      try {
        await notificationService.invitation({
          to,
          firstName: person?.firstName ?? "",
          eventTitle: event.title,
          eventVenue: event.venue,
          eventCity: event.city,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          subject: primary.subject,
          body: this.bilingualInvitationBody(copies),
          token: invitation.token,
          locale: DEFAULT_LOCALE,
        });
        await invitationRepository.markSent(invitation.id);
        await eventMembershipRepository.upsertInvited(
          invitation.eventId,
          invitation.personId,
          invitation.kind
        );
      } catch {
        await invitationRepository.markFailed(invitation.id);
        failed += 1;
      }
    }

    const updated = await invitationBatchRepository.updateStatus(
      id,
      failed > 0 && failed === invitations.length
        ? INVITATION_BATCH_STATUSES.FAILED
        : INVITATION_BATCH_STATUSES.SENT,
      new Date()
    );

    return {
      batch: updated,
      invitations: await invitationRepository.listByBatch(id),
      queuedCount: invitations.length,
      failedCount: failed,
    };
  }

  async acceptByToken(
    token: string,
    body?: unknown,
    actor?: { id: string } | null
  ) {
    const invitation = await this.requireByToken(token);
    if (this.isExpired(invitation.expiresAt)) {
      throw new ValidationException("This invitation has expired.");
    }

    const event = await eventService.getById(invitation.eventId);
    const kind = invitation.kind || EVENT_MEMBERSHIP_KINDS.CAMPER;
    const membership = await eventMembershipRepository.upsertInvited(
      invitation.eventId,
      invitation.personId,
      kind
    );

    const person = await personRepository.findById(invitation.personId);
    const accountExists = await authService.hasAccountForPerson(person);
    const parsed = parseAcceptInvitation(body);
    const password = accountExists
      ? parsed.password
      : parseNewInvitePassword(body).password;
    const session = await authService.completeGuestInvite(
      person,
      password,
      actor
    );
    const accepted =
      invitation.status === INVITATION_STATUSES.ACCEPTED
        ? invitation
        : await invitationRepository.markAccepted(invitation.id);
    await eventMembershipRepository.markRegistered(membership.id);
    if (invitation.status !== INVITATION_STATUSES.ACCEPTED) {
      await notificationService.registrationConfirmed({
        to: person.email,
        firstName: person.firstName,
        eventTitle: event.title,
        kind: invitation.kind,
      });
    }
    await auditService.record({
      action: "update",
      entity: "Invitation",
      entityId: accepted.id,
      before: invitation,
      after: accepted,
    });
    return {
      invitation: accepted,
      membership,
      person,
      accountCreated: session.created,
      token: session.token,
      user: session.user,
    };
  }

  async getByToken(token: string) {
    const invitation = await this.requireByToken(token);
    const event = await eventService.getById(invitation.eventId);
    const person = invitation.person ?? null;
    const needsPassword = person
      ? !(await authService.hasAccountForPerson(person))
      : true;
    return { invitation, event, person, needsPassword };
  }

  private async requireByToken(token: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      throw new ValidationException("Invitation was not found.");
    }
    return invitation;
  }

  private isExpired(expiresAt: Date | string | null | undefined) {
    return Boolean(
      expiresAt && new Date(expiresAt).getTime() < Date.now()
    );
  }

  private async localizedBatchCopies(batch: InvitationBatch) {
    const copies = {} as Record<
      AppLocale,
      { subject: string; body: string }
    >;
    for (const locale of LOCALES) {
      const [localized] = await contentTranslationRepository.localize(
        CONTENT_ENTITY_TYPES.invitationBatch,
        [batch],
        locale,
        true
      );
      copies[locale] = {
        subject: localized.subject,
        body: localized.body,
      };
    }
    return copies;
  }

  private bilingualInvitationBody(
    copies: Record<AppLocale, { subject: string; body: string }>
  ) {
    const english = copies.en?.body ?? "";
    const french = copies.fr?.body ?? "";
    if (!french || french === english || isEmptyHtml(french)) {
      return english;
    }
    return `${english}<hr /><p><strong>Français</strong></p>${french}`;
  }
}

export const invitationService = new InvitationService();
