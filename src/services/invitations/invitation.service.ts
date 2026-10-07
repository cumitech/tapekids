import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import { APP_SETTING_KEYS } from "@/constants/app-settings";
import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_BATCH_STATUSES,
  INVITATION_STATUSES,
  usesYfIdInvite,
} from "@/constants/event-participation";
import type { Invitation } from "@/data/entities/invitation";
import type { InvitationBatch } from "@/data/entities/invitation-batch";
import { parseCreateInvitationBatch } from "@/data/dtos/invitation-batch.dto";
import {
  parseAcceptInvitation,
  parseInviteYfId,
  parseNewInvitePassword,
  parseRecipientEmail,
  parseResendInvitations,
} from "@/data/dtos/invitation.dto";
import { AppSettingRepository } from "@/data/repositories/app-setting.repository";
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
import {
  extendedInvitationExpiry,
  invitationExpiresAt,
  isInvitationExpired,
} from "@/lib/invitations/expiry";
import { personGreetingName } from "@/lib/people/display-name";
import { inviteAcceptMode, inviteeIsActor } from "@/lib/invitations/accept-mode";
import { normalizeYfId, yfIdsMatch } from "@/lib/people/yf-id";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { translationsFromInput } from "@/lib/content-i18n/input";
import { pickTranslatedField } from "@/lib/content-i18n/pick";
import { isEmptyHtml } from "@/lib/html";
import { isStandardEmail, normalizeEmail } from "@/lib/email";
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
const appSettingRepository = new AppSettingRepository();

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
      pickTranslatedField(input.translations, "subject", input.subject) || "";
    const bodyText = sanitizeRichText(
      pickTranslatedField(input.translations, "body", input.body, {
        html: true,
      }) || ""
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
      linksOpen: true,
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
        emailSnapshot: person.email || "",
        status: INVITATION_STATUSES.QUEUED,
        linksOpen: true,
        sentAt: null,
        acceptedAt: null,
        expiresAt: invitationExpiresAt(),
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

  async listByMailingList(mailingListId: string) {
    await mailingListRepository.findById(mailingListId);
    const batches = await invitationBatchRepository.listByMailingList(mailingListId);
    const counts = await invitationRepository.countByBatches(
      batches.map((batch) => batch.id)
    );
    return batches.map((batch) => ({
      id: batch.id,
      eventId: batch.eventId,
      subject: batch.subject,
      status: batch.status,
      sentAt: batch.sentAt,
      counts: deliveryCounts(
        counts.filter((row) => row.batchId === batch.id)
      ),
    }));
  }

  async listRecipients(batchId: string) {
    await invitationBatchRepository.findById(batchId);
    const invitations = await invitationRepository.listByBatch(batchId);
    return invitations.map(recipientOf);
  }

  async sendBatch(id: string) {
    const invitations = await invitationRepository.listByBatch(id);
    const { failed, total } = await this.deliverInvitations(id, invitations);
    return {
      batch: await invitationBatchRepository.findById(id),
      invitations: await invitationRepository.listByBatch(id),
      queuedCount: total,
      failedCount: failed,
    };
  }

  async resendSelected(batchId: string, body: unknown) {
    const { ids } = parseResendInvitations(body);
    const unique = [...new Set(ids)];
    const invitations = await invitationRepository.listByBatch(batchId);
    const byId = new Map(invitations.map((row) => [row.id, row]));
    const chosen = unique.map((id) => byId.get(id));
    if (chosen.some((row) => !row)) {
      throw new ValidationException(
        "One or more recipients are not in this send."
      );
    }
    const pending: Invitation[] = [];
    for (const row of chosen) {
      if (row && RETRYABLE_INVITATION_STATUSES.has(row.status)) {
        pending.push(row);
      }
    }
    if (pending.length === 0) {
      throw new ValidationException(
        "Select failed or pending recipients to resend."
      );
    }
    const { failed } = await this.deliverInvitations(batchId, pending);
    return {
      sentCount: pending.length - failed,
      failedCount: failed,
    };
  }

  async updateRecipientEmail(invitationId: string, body: unknown) {
    const invitation = await invitationRepository.findById(invitationId);
    if (!RETRYABLE_INVITATION_STATUSES.has(invitation.status)) {
      throw new ValidationException("This invitation was already sent.");
    }
    const email = normalizeEmail(parseRecipientEmail(body).email);
    if (!isStandardEmail(email, 128)) {
      throw new ValidationException("Enter a valid email address.");
    }
    const before = await personRepository.findById(invitation.personId);
    await personRepository.update(invitation.personId, { email });
    await invitationRepository.updateEmailSnapshot(invitation.id, email);
    const after = await personRepository.findById(invitation.personId);
    await auditService.record({
      action: "update",
      entity: "Person",
      entityId: invitation.personId,
      before,
      after,
    });
    return recipientOf(await invitationRepository.findById(invitation.id));
  }

  async acceptByToken(
    token: string,
    body?: unknown,
    actor?: { id: string; personId?: string | null } | null
  ) {
    const invitation = await this.requireByToken(token);
    await this.assertLinkUsable(invitation);

    const kind = invitation.kind || EVENT_MEMBERSHIP_KINDS.CAMPER;
    const person = await personRepository.findById(invitation.personId);
    const event = await eventService.getById(invitation.eventId);

    const session = usesYfIdInvite(kind)
      ? await this.acceptWithYfId(person, body, actor)
      : await this.acceptWithPassword(person, body, actor);
    const registered = await this.finishAcceptance(invitation, person, kind, event);
    return {
      ...registered,
      accountCreated: session.created,
      token: session.token,
      user: session.user,
    };
  }

  /** Enter the YF ID on behalf of someone who received an invite and could not type it. */
  async acceptDeliveredYfInvites(
    person: Awaited<ReturnType<PersonRepository["findById"]>>
  ) {
    if (!normalizeYfId(person.yfId)) {
      return 0;
    }
    const invitations = await invitationRepository.listByPersonStatus(
      person.id,
      INVITATION_STATUSES.SENT
    );
    let acceptedCount = 0;
    for (const invitation of invitations) {
      const kind = invitation.kind || EVENT_MEMBERSHIP_KINDS.CAMPER;
      if (!usesYfIdInvite(kind)) {
        continue;
      }
      const event = await eventService.getById(invitation.eventId);
      await authService.completeGuestInvite(person, { verifiedByYfId: true });
      await this.finishAcceptance(invitation, person, kind, event);
      acceptedCount += 1;
    }
    return acceptedCount;
  }

  private async finishAcceptance(
    invitation: Invitation,
    person: Awaited<ReturnType<PersonRepository["findById"]>>,
    kind: (typeof EVENT_MEMBERSHIP_KINDS)[keyof typeof EVENT_MEMBERSHIP_KINDS],
    event: { title: string }
  ) {
    const membership = await eventMembershipRepository.upsertInvited(
      invitation.eventId,
      invitation.personId,
      kind
    );
    const accepted =
      invitation.status === INVITATION_STATUSES.ACCEPTED
        ? invitation
        : await invitationRepository.markAccepted(invitation.id);
    await eventMembershipRepository.markRegistered(membership.id);
    if (invitation.status !== INVITATION_STATUSES.ACCEPTED && person.email) {
      await notificationService.registrationConfirmed({
        to: person.email,
        firstName: personGreetingName(person),
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
    return { invitation: accepted, membership, person };
  }

  async getByToken(
    token: string,
    actor?: { id: string; personId?: string | null } | null
  ) {
    const invitation = await this.requireByToken(token);
    await this.assertLinkUsable(invitation);
    const event = await eventService.getById(invitation.eventId);
    const person = invitation.person ?? null;
    const kind = invitation.kind || EVENT_MEMBERSHIP_KINDS.CAMPER;
    const alreadyThisUser = inviteeIsActor(actor, person?.id);
    const { needsYfId, needsPassword } = inviteAcceptMode({
      kind,
      alreadyThisUser,
      hasAccount: person
        ? await authService.hasAccountForPerson(person)
        : false,
    });
    return {
      invitation,
      event,
      person: publicInvitePerson(person),
      needsYfId,
      needsPassword,
    };
  }

  private async acceptWithYfId(
    person: Awaited<ReturnType<PersonRepository["findById"]>>,
    body: unknown,
    actor?: { id: string; personId?: string | null } | null
  ) {
    const alreadyThisUser = inviteeIsActor(actor, person.id);
    if (!alreadyThisUser) {
      if (!normalizeYfId(person.yfId)) {
        throw new ValidationException(
          "This invitation has no Young Foundations ID. Ask an admin to add your YF ID."
        );
      }
      const { yfId } = parseInviteYfId(body);
      if (!yfIdsMatch(yfId, person.yfId)) {
        throw new ValidationException("YF ID does not match this invitation.");
      }
    }
    return authService.completeGuestInvite(person, {
      verifiedByYfId: true,
      actor,
    });
  }

  private async acceptWithPassword(
    person: Awaited<ReturnType<PersonRepository["findById"]>>,
    body: unknown,
    actor?: { id: string; personId?: string | null } | null
  ) {
    const accountExists = await authService.hasAccountForPerson(person);
    const parsed = parseAcceptInvitation(body);
    const password = accountExists
      ? parsed.password
      : parseNewInvitePassword(body).password;
    return authService.completeGuestInvite(person, {
      password,
      actor,
    });
  }

  async setLinksOpen(open: boolean) {
    const invitationLinksOpen = await appSettingRepository.setBoolean(
      APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
      open
    );
    await auditService.record({
      action: open ? "reopen" : "close",
      entity: "InvitationLinks",
      entityId: APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
      after: { invitationLinksOpen },
    });
    return { invitationLinksOpen };
  }

  async areLinksOpen() {
    return appSettingRepository.getBoolean(
      APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
      true
    );
  }

  async setBatchLinksOpen(id: string, open: boolean) {
    const before = await invitationBatchRepository.findById(id);
    const batch = await invitationBatchRepository.setLinksOpen(id, open);
    await auditService.record({
      action: open ? "reopen" : "close",
      entity: "InvitationBatch",
      entityId: id,
      before: { linksOpen: before.linksOpen },
      after: { linksOpen: batch.linksOpen },
    });
    return { id: batch.id, linksOpen: Boolean(batch.linksOpen) };
  }

  async extendInvitation(id: string) {
    const before = await invitationRepository.findById(id);
    const expiresAt = extendedInvitationExpiry(before.expiresAt);
    const invitation = await invitationRepository.setExpiresAt(id, expiresAt);
    await auditService.record({
      action: "extend",
      entity: "Invitation",
      entityId: id,
      before: { expiresAt: before.expiresAt },
      after: { expiresAt: invitation.expiresAt },
    });
    return { id: invitation.id, expiresAt: invitation.expiresAt };
  }

  async extendBatch(id: string) {
    const invitations = await invitationRepository.listByBatch(id);
    for (const invitation of invitations) {
      await invitationRepository.setExpiresAt(
        invitation.id,
        extendedInvitationExpiry(invitation.expiresAt)
      );
    }
    await auditService.record({
      action: "extend",
      entity: "InvitationBatch",
      entityId: id,
      after: { extended: invitations.length },
    });
    return { id, extended: invitations.length };
  }

  async setInvitationLinksOpen(id: string, open: boolean) {
    const before = await invitationRepository.findById(id);
    const invitation = await invitationRepository.setLinksOpen(id, open);
    await auditService.record({
      action: open ? "reopen" : "close",
      entity: "Invitation",
      entityId: id,
      before: { linksOpen: before.linksOpen },
      after: { linksOpen: invitation.linksOpen },
    });
    return { id: invitation.id, linksOpen: Boolean(invitation.linksOpen) };
  }

  private async requireByToken(token: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      throw new ValidationException("Invitation was not found.");
    }
    return invitation;
  }

  private async assertLinkUsable(invitation: {
    batchId: string;
    linksOpen?: boolean | null;
    expiresAt?: Date | string | null;
  }) {
    if (!(await this.areLinksOpen())) {
      throw new ValidationException("Invitation links are closed.");
    }
    if (!flagOpen(invitation.linksOpen)) {
      throw new ValidationException("This invitation link is closed.");
    }
    const batch = await invitationBatchRepository.findById(invitation.batchId);
    if (!flagOpen(batch.linksOpen)) {
      throw new ValidationException("This invitation batch is closed.");
    }
    if (isInvitationExpired(invitation.expiresAt)) {
      throw new ValidationException("This invitation has expired.");
    }
  }

  private async deliverInvitations(batchId: string, invitations: Invitation[]) {
    if (!isMailConfigured()) {
      throw new ValidationException("Mail is not configured.");
    }

    const event = await eventService.getById(
      (await invitationBatchRepository.findById(batchId)).eventId
    );
    const rawBatch = await invitationBatchRepository.updateStatus(
      batchId,
      INVITATION_BATCH_STATUSES.SENDING
    );
    const copies = await this.localizedBatchCopies(rawBatch);
    const primary = copies[DEFAULT_LOCALE];
    let failed = 0;

    for (const invitation of invitations) {
      if (
        invitation.status === INVITATION_STATUSES.SENT ||
        invitation.status === INVITATION_STATUSES.ACCEPTED
      ) {
        continue;
      }

      const person = invitation.person;
      const directoryEmail = normalizeEmail(person?.email);
      const to = directoryEmail || normalizeEmail(invitation.emailSnapshot);
      if (directoryEmail && directoryEmail !== invitation.emailSnapshot) {
        await invitationRepository.updateEmailSnapshot(
          invitation.id,
          directoryEmail
        );
      }
      if (!to) {
        await invitationRepository.markFailed(invitation.id);
        failed += 1;
        continue;
      }

      try {
        await notificationService.invitation({
          to,
          firstName: personGreetingName(person),
          eventTitle: event.title,
          eventVenue: event.venue,
          eventCity: event.city,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          eventType: event.eventType === "day_event" ? "day_event" : "camp",
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

    const all = await invitationRepository.listByBatch(batchId);
    const anySent = all.some(
      (row) =>
        row.status === INVITATION_STATUSES.SENT ||
        row.status === INVITATION_STATUSES.ACCEPTED
    );
    const stillFailed = all.some(
      (row) => row.status === INVITATION_STATUSES.FAILED
    );
    await invitationBatchRepository.updateStatus(
      batchId,
      stillFailed && !anySent
        ? INVITATION_BATCH_STATUSES.FAILED
        : INVITATION_BATCH_STATUSES.SENT,
      new Date()
    );

    return { failed, total: all.length };
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
    const french = copies.fr?.body ?? "";
    const english = copies.en?.body ?? "";
    if (!english || english === french || isEmptyHtml(english)) {
      return french;
    }
    if (!french || isEmptyHtml(french)) {
      return english;
    }
    return `${french}<hr /><p><strong>English</strong></p>${english}`;
  }
}

const RETRYABLE_INVITATION_STATUSES = new Set<string>([
  INVITATION_STATUSES.QUEUED,
  INVITATION_STATUSES.FAILED,
  INVITATION_STATUSES.EXPIRED,
]);

function recipientOf(invitation: Invitation) {
  const person = invitation.person;
  const directoryEmail = normalizeEmail(person?.email);
    return {
    id: invitation.id,
    personId: invitation.personId,
    fullName: person?.fullName ?? "",
    email: directoryEmail || normalizeEmail(invitation.emailSnapshot),
    yfId: person?.yfId ?? null,
    status: invitation.status,
    sentAt: invitation.sentAt,
  };
}

function deliveryCounts(
  rows: Array<{ status: string; total: string | number }>
) {
  const counts = { pending: 0, success: 0, failed: 0, accepted: 0, expired: 0 };
  for (const row of rows) {
    const total = Number(row.total) || 0;
    if (row.status === INVITATION_STATUSES.QUEUED) {
      counts.pending += total;
    } else if (row.status === INVITATION_STATUSES.SENT) {
      counts.success += total;
    } else if (row.status === INVITATION_STATUSES.FAILED) {
      counts.failed += total;
    } else if (row.status === INVITATION_STATUSES.ACCEPTED) {
      counts.accepted += total;
    } else if (row.status === INVITATION_STATUSES.EXPIRED) {
      counts.expired += total;
    }
  }
  return counts;
}

function flagOpen(value: unknown) {
  return value !== false && value !== 0 && value !== "0" && value !== "false";
}

function publicInvitePerson(person: { toJSON?: () => object } | null) {
  if (!person) {
    return null;
  }
  const record = (
    typeof person.toJSON === "function" ? person.toJSON() : person
  ) as Record<string, unknown>;
  const { yfId: _yfId, ...safe } = record;
  return safe;
}

export const invitationService = new InvitationService();
