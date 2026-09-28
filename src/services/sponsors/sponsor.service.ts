import { EVENT_MEMBERSHIP_KINDS } from "@/constants/event-participation";
import { parseCreatePerson, toCreatePersonPayload } from "@/data/dtos/person.dto";
import { parseRegisterSponsor } from "@/data/dtos/sponsor.dto";
import { SponsorRepository } from "@/data/repositories/sponsor.repository";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { normalizeStoredPhone } from "@/lib/phone";
import { toPaymentJson } from "@/lib/payments/public";
import { auditService } from "@/services/audit/audit.service";
import { eventService } from "@/services/events/event.service";
import { paymentService } from "@/services/payments/payment.service";

const sponsorRepository = new SponsorRepository();
const personRepository = new PersonRepository();
const eventMembershipRepository = new EventMembershipRepository();

function sponsorJson(sponsor: Awaited<ReturnType<SponsorRepository["findById"]>>) {
  return {
    id: sponsor.id,
    anonymous: Boolean(sponsor.anonymous),
    paymentPhone: sponsor.paymentPhone,
    createdAt: sponsor.get("createdAt"),
    person: sponsor.person
      ? {
          id: sponsor.person.id,
          fullName: sponsor.person.fullName,
          email: sponsor.person.email,
        }
      : undefined,
    event: sponsor.event
      ? { id: sponsor.event.id, title: sponsor.event.title }
      : undefined,
    payment: sponsor.payment ? toPaymentJson(sponsor.payment) : undefined,
  };
}

export class SponsorService {
  async list(query: ListQuery) {
    const result = await sponsorRepository.list(query);
    return {
      ...result,
      data: result.data.map(sponsorJson),
    };
  }

  async register(body: unknown) {
    const input = parseRegisterSponsor(body);
    const event = await eventService.getById(input.eventId);
    if (!event.isPublished) {
      throw new ValidationException("Choose a published event.");
    }

    const email = input.email;
    let person = await personRepository.findByEmail(email);
    if (!person) {
      person = await personRepository.create(
        toCreatePersonPayload(
          parseCreatePerson({
            fullName: input.fullName,
            email,
            phone: input.phone,
            isTrophy: false,
          })
        )
      );
      await auditService.record({
        action: "create",
        entity: "Person",
        entityId: person.id,
        after: person,
      });
    }

    await eventMembershipRepository.upsertInvited(
      event.id,
      person.id,
      EVENT_MEMBERSHIP_KINDS.SPONSOR
    );

    const charge = await paymentService.initiate({
      eventId: event.id,
      personId: person.id,
      kind: EVENT_MEMBERSHIP_KINDS.SPONSOR,
      method: input.method,
      phone: input.paymentPhone,
      amount: input.amount,
    });

    const sponsor = await sponsorRepository.create({
      id: nanoid(),
      personId: person.id,
      eventId: event.id,
      anonymous: input.anonymous,
      paymentPhone: normalizeStoredPhone(input.paymentPhone) || input.paymentPhone,
      paymentId: charge.payment?.id ?? null,
    });

    return {
      sponsor: sponsorJson(await sponsorRepository.findById(sponsor.id)),
      ...charge,
    };
  }

  async refresh(id: string) {
    const sponsor = await sponsorRepository.findById(id);
    if (!sponsor.paymentId) {
      return { sponsor: sponsorJson(sponsor) };
    }
    const payment = await paymentService.refresh(sponsor.paymentId);
    const fresh = await sponsorRepository.findById(id);
    return {
      sponsor: sponsorJson(fresh),
      payment: toPaymentJson(payment),
    };
  }
}

export const sponsorService = new SponsorService();
