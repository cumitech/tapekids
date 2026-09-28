import type { Payment } from "@/data/entities/payment";

export function toPaymentJson(payment: Payment) {
  const row = payment.toJSON() as Payment & {
    createdAt?: string | Date | null;
  };
  const createdAt = row.createdAt
    ? typeof row.createdAt === "string"
      ? row.createdAt
      : row.createdAt.toISOString()
    : null;

  return {
    id: payment.id,
    eventId: payment.eventId,
    personId: payment.personId,
    kind: payment.kind,
    amount: String(payment.amount ?? "0"),
    currency: payment.currency || "XAF",
    status: payment.status,
    trackingId: payment.trackingId,
    providerRef: payment.providerRef ?? null,
    createdAt,
    person: payment.person
      ? {
          id: payment.person.id,
          fullName: payment.person.fullName,
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
