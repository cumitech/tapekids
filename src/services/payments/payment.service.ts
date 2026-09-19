import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { getPaymentAdapter } from "@/adapters/payments";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/constants/event-participation";
import type { Payment } from "@/data/entities/payment";
import type { User } from "@/data/entities/user";
import { parseInitiatePayment, parseUpdatePaymentStatus } from "@/data/dtos/payment.dto";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { PaymentRepository } from "@/data/repositories/payment.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ForbiddenException } from "@/exceptions/forbidden.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { isNamedError } from "@/lib/api/app-error";
import { campayConfig, isCampayConfigured } from "@/lib/integrations/campay.config";
import { publicAppUrl } from "@/lib/app-url";
import { chargeAmountForMembership } from "@/lib/payments/amount";
import {
  PAYMENT_METHODS,
  paymentKindForMembership,
  resolveMembershipKind,
} from "@/lib/payments/charge";
import { toCameroonMsisdn } from "@/lib/payments/phone";
import { toPaymentJson } from "@/lib/payments/public";
import { isPersonProfileComplete } from "@/lib/people/profile-completeness";
import { paymentStatusFromCampay } from "@/lib/payments/status";
import { auditService } from "@/services/audit/audit.service";
import { eventService } from "@/services/events/event.service";
import { notificationService } from "@/services/notifications/notification.service";

const paymentRepository = new PaymentRepository();
const personRepository = new PersonRepository();
const eventMembershipRepository = new EventMembershipRepository();

function publicPayment(payment: Payment) {
  return toPaymentJson(payment);
}

async function withLocalizedEvents<T extends { event?: { id: string } | null }>(
  result: { data: T[]; total: number; offset: number; limit: number }
) {
  const events = result.data
    .map((row) => row.event)
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  if (events.length === 0) {
    return result;
  }
  const localized = await contentTranslationRepository.localize(
    CONTENT_ENTITY_TYPES.event,
    events,
    resolveContentLocale()
  );
  contentTranslationRepository.overlay(
    events,
    localized,
    CONTENT_ENTITY_TYPES.event
  );
  return result;
}

export class PaymentService {
  listByEvent(eventId: string, query: ListQuery) {
    return paymentRepository
      .listByEvent(eventId, query)
      .then((result) => withLocalizedEvents(result));
  }

  listByPerson(personId: string, query: ListQuery) {
    return paymentRepository
      .listByPerson(personId, query)
      .then((result) => withLocalizedEvents(result));
  }

  getById(id: string) {
    return paymentRepository.findById(id);
  }

  async initiateOwn(user: User, body: unknown) {
    if (!user.personId) {
      throw new ForbiddenException(
        "No person profile is linked to this account."
      );
    }

    const person = await personRepository.findById(user.personId);
    if (!isPersonProfileComplete(person.toJSON())) {
      throw new ValidationException(
        "Complete your person profile before paying for an event."
      );
    }

    const input = parseInitiatePayment({
      ...(body && typeof body === "object" && !Array.isArray(body) ? body : {}),
      personId: user.personId,
    });
    const membershipKind = resolveMembershipKind(input);
    const memberships = await eventMembershipRepository.findByEventAndPerson(
      input.eventId,
      user.personId,
      membershipKind
    );
    if (memberships.length === 0) {
      throw new ForbiddenException("You are not a member of this event.");
    }

    return this.initiate(input);
  }

  async refreshOwn(user: User, id: string) {
    const payment = await this.getById(id);
    if (!user.personId || payment.personId !== user.personId) {
      throw new ForbiddenException();
    }
    return publicPayment(await this.refresh(id));
  }

  async initiate(body: unknown) {
    if (!isCampayConfigured()) {
      throw new ValidationException("CamPay is not configured.");
    }

    const input = parseInitiatePayment(body);
    const event = await eventService.getById(input.eventId);
    const person = await personRepository.findById(input.personId);
    const membershipKind = resolveMembershipKind(input);
    const kind = input.paymentKind ?? paymentKindForMembership(membershipKind);
    const amount = chargeAmountForMembership(event, membershipKind);
    const currency = (event.currency || campayConfig().currency).toUpperCase();

    if (amount <= 0) {
      const existing = await paymentRepository.findOpen(
        event.id,
        person.id,
        kind
      );
      if (existing?.status === PAYMENT_STATUSES.PAID) {
        return { payment: publicPayment(existing), waived: true };
      }
      const payment = existing
        ? await paymentRepository.update(existing.id, {
            amount: "0",
            currency,
            status: PAYMENT_STATUSES.WAIVED,
          })
        : await paymentRepository.create({
            id: nanoid(),
            eventId: event.id,
            personId: person.id,
            kind,
            amount: "0",
            currency,
            status: PAYMENT_STATUSES.WAIVED,
            providerRef: null,
          });
      await auditService.record({
        action: "update",
        entity: "Payment",
        entityId: payment.id,
        before: existing,
        after: payment,
      });
      await this.notifyStatusChange(
        existing?.status ?? PAYMENT_STATUSES.PENDING,
        payment
      );
      return { payment: publicPayment(payment), waived: true };
    }

    const existing = await paymentRepository.findOpen(event.id, person.id, kind);
    if (existing?.status === PAYMENT_STATUSES.PAID) {
      return { payment: publicPayment(existing), alreadyPaid: true };
    }

    const payment =
      existing ??
      (await paymentRepository.create({
        id: nanoid(),
        eventId: event.id,
        personId: person.id,
        kind,
        amount: String(amount),
        currency,
        status: PAYMENT_STATUSES.PENDING,
        providerRef: null,
      }));

    const description = `${event.title} (${kind})`;
    const adapter = getPaymentAdapter();

    try {
      if (input.method === PAYMENT_METHODS.LINK) {
        const result = await adapter.createPaymentLink({
          amount,
          currency,
          description,
          externalReference: payment.id,
          email: person.email,
          firstName: person.firstName,
          lastName: person.lastName,
          phone: toCameroonMsisdn(input.phone || person.phone || "", {
            required: false,
          }),
          redirectUrl: publicAppUrl(
            input.redirectPath,
            resolveContentLocale(),
            `/dashboard/people/show/${person.id}`
          ),
        });
        const updated = await paymentRepository.update(payment.id, {
          providerRef: result.reference,
          status: PAYMENT_STATUSES.PENDING,
        });
        await auditService.record({
          action: "update",
          entity: "Payment",
          entityId: updated.id,
          before: payment,
          after: updated,
        });
        return { payment: publicPayment(updated), link: result.link, status: result.status };
      }

      const from = toCameroonMsisdn(input.phone || person.phone || "");
      if (!from) {
        throw new ValidationException("A Cameroon mobile number is required.");
      }

      const result = await adapter.collect({
        amount,
        currency,
        from,
        description,
        externalReference: payment.id,
      });
      const updated = await paymentRepository.update(payment.id, {
        providerRef: result.reference,
        status: PAYMENT_STATUSES.PENDING,
      });
      await auditService.record({
        action: "update",
        entity: "Payment",
        entityId: updated.id,
        before: payment,
        after: updated,
      });
      return {
        payment: publicPayment(updated),
        ussdCode: result.ussdCode,
        operator: result.operator,
        status: result.status,
      };
    } catch (error) {
      if (isNamedError(error, "ValidationException")) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "CamPay request failed.";
      throw new ValidationException(message);
    }
  }

  async applyWebhook(payload: Record<string, string>) {
    const externalReference = (
      payload.external_reference ||
      payload.externalReference ||
      ""
    ).trim();
    const reference = (payload.reference || "").trim();
    const mapped = paymentStatusFromCampay(payload.status || "");

    if (!externalReference && !reference) {
      throw new ValidationException("Missing external_reference.");
    }

    const payment =
      (externalReference
        ? await paymentRepository.findByExternalReference(externalReference)
        : null) ??
      (reference
        ? await paymentRepository.findByExternalReference(reference)
        : null);

    if (!payment) {
      throw new ValidationException("Payment not found for CamPay callback.");
    }

    if (payment.status === PAYMENT_STATUSES.PAID) {
      return payment;
    }

    if (!mapped) {
      return payment;
    }

    const updated = await paymentRepository.update(payment.id, {
      status: mapped,
      providerRef: reference || payment.providerRef,
    });
    await auditService.record({
      action: "update",
      entity: "Payment",
      entityId: updated.id,
      before: payment,
      after: updated,
    });
    await this.notifyStatusChange(payment.status, updated);
    return updated;
  }

  async refresh(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment.providerRef) {
      return payment;
    }
    const adapter = getPaymentAdapter();
    const result = await adapter.getStatus(payment.providerRef);
    const mapped = paymentStatusFromCampay(result.status);
    if (!mapped || payment.status === PAYMENT_STATUSES.PAID) {
      return payment;
    }
    const updated = await paymentRepository.update(payment.id, { status: mapped });
    await auditService.record({
      action: "update",
      entity: "Payment",
      entityId: updated.id,
      before: payment,
      after: updated,
    });
    await this.notifyStatusChange(payment.status, updated);
    return updated;
  }

  async markStatus(id: string, body: unknown) {
    const input = parseUpdatePaymentStatus(body);
    const before = await paymentRepository.findById(id);
    const updated = await paymentRepository.update(id, { status: input.status });
    await auditService.record({
      action: "update",
      entity: "Payment",
      entityId: id,
      before,
      after: updated,
    });
    await this.notifyStatusChange(before.status, updated);
    return updated;
  }

  private async notifyStatusChange(
    previousStatus: PaymentStatus,
    payment: Payment
  ) {
    const person = await personRepository.findById(payment.personId);
    const event = await eventService.getById(payment.eventId);
    await notificationService.paymentStatusChanged({
      previousStatus,
      payment,
      person,
      event,
    });
  }
}

export const paymentService = new PaymentService();
