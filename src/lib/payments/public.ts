import type { Payment } from "@/data/entities/payment";

export function toPaymentJson(payment: Payment) {
  return {
    id: payment.id,
    eventId: payment.eventId,
    personId: payment.personId,
    kind: payment.kind,
    amount: String(payment.amount ?? "0"),
    currency: payment.currency || "XAF",
    status: payment.status,
    providerRef: payment.providerRef ?? null,
    person: payment.person
      ? {
          firstName: payment.person.firstName,
          lastName: payment.person.lastName,
          email: payment.person.email,
        }
      : undefined,
    event: payment.event
      ? {
          id: payment.event.id,
          title: payment.event.title,
        }
      : undefined,
  };
}
