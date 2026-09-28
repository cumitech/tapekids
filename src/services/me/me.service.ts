import type { User } from "@/data/entities";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { PaymentRepository } from "@/data/repositories/payment.repository";
import { UserRepository } from "@/data/repositories/user.repository";
import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { toPublicUser } from "@/lib/api/session";
import { chargeAmountForMembership } from "@/lib/payments/amount";
import {
  eventCurrency,
  paymentKindForMembership,
} from "@/lib/payments/charge";
import type { MeMembership, MeProfile } from "@/models/me/me.model";
import { paymentService } from "@/services/payments/payment.service";
import { personService } from "@/services/people/person.service";

const eventMembershipRepository = new EventMembershipRepository();
const paymentRepository = new PaymentRepository();
const userRepository = new UserRepository();

const OWN_PAYMENTS_QUERY = {
  offset: 0,
  limit: 100,
  sort: "createdAt",
  order: "DESC" as const,
};

function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

export class MeService {
  async getProfile(user: User): Promise<MeProfile> {
    const [person, memberships] = await Promise.all([
      user.personId ? personService.getById(user.personId) : null,
      user.personId
        ? eventMembershipRepository.listByPerson(user.personId)
        : [],
    ]);
    const nestedEvents = memberships
      .map((membership) => membership.event)
      .filter((event): event is NonNullable<typeof event> => Boolean(event));
    const [payments] = await Promise.all([
      memberships.length > 0 && user.personId
        ? paymentRepository.listRecentByPerson(user.personId)
        : Promise.resolve([]),
      nestedEvents.length > 0
        ? contentTranslationRepository
            .localize(
              CONTENT_ENTITY_TYPES.event,
              nestedEvents,
              resolveContentLocale()
            )
            .then((localized) => {
              contentTranslationRepository.overlay(
                nestedEvents,
                localized,
                CONTENT_ENTITY_TYPES.event
              );
            })
        : Promise.resolve(),
    ]);

    return {
      user: {
        ...toPublicUser(user),
        passwordChosen: user.passwordChosen !== false,
      },
      person: person ? (person.toJSON() as MeProfile["person"]) : null,
      memberships: memberships.map((membership) => {
        const event = membership.event;
        const eventJson = event
          ? (event.toJSON() as Record<string, unknown>)
          : null;
        const summary: MeMembership["event"] = eventJson
          ? {
              id: String(eventJson.id),
              title: String(eventJson.title ?? ""),
              slug: String(eventJson.slug ?? ""),
              summary: String(eventJson.summary ?? ""),
              description: "",
              venue: String(eventJson.venue ?? ""),
              city: String(eventJson.city ?? ""),
              startsAt: toIso(eventJson.startsAt as Date | string) ?? "",
              endsAt: toIso(eventJson.endsAt as Date | string | null),
              requiresParticipantFee: Boolean(eventJson.requiresParticipantFee),
              participantFeeAmount: eventJson.participantFeeAmount as
                | string
                | number
                | null,
              currency: (eventJson.currency as string) ?? "XAF",
              coordinatorFundAmount: eventJson.coordinatorFundAmount as
                | string
                | number
                | null,
              sponsorFundAmount: eventJson.sponsorFundAmount as
                | string
                | number
                | null,
              imageUrl: (eventJson.imageUrl as string | null) ?? null,
            }
          : null;
        const paymentKind = paymentKindForMembership(membership.kind);
        const payment = payments.find(
          (row) =>
            row.eventId === membership.eventId && row.kind === paymentKind,
        );
        const mapped: MeMembership = {
          id: membership.id,
          kind: membership.kind,
          status: membership.status,
          event: summary,
          payment: payment
            ? {
                id: payment.id,
                eventId: payment.eventId,
                kind: payment.kind,
                amount: String(payment.amount),
                currency: payment.currency,
                status: payment.status,
              }
            : null,
          dueAmount: summary
            ? chargeAmountForMembership(summary, membership.kind)
            : 0,
          currency: summary ? eventCurrency(summary) : "XAF",
        };
        return mapped;
      }),
    };
  }

  async updatePerson(user: User, body: unknown) {
    if (!user.personId) {
      const created = await personService.create({
        ...(typeof body === "object" && body ? body : {}),
        email: user.email,
      });
      await userRepository.linkPerson(user.id, created.id);
      return personService.getById(created.id);
    }

    return personService.update(user.personId, body);
  }

  async listPayments(user: User) {
    if (!user.personId) {
      return { data: [], total: 0 };
    }
    return paymentService.listByPerson(user.personId, OWN_PAYMENTS_QUERY);
  }

  async initiatePayment(user: User, body: unknown) {
    return paymentService.initiateOwn(user, body);
  }

  async refreshPayment(user: User, id: string) {
    return paymentService.refreshOwn(user, id);
  }
}

export const meService = new MeService();
