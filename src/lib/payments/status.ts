import { PAYMENT_STATUSES, type PaymentStatus } from "@/constants/event-participation";

export function paymentStatusFromCampay(status: string): PaymentStatus | null {
  const normalized = status.trim().toUpperCase();
  if (normalized === "SUCCESSFUL") {
    return PAYMENT_STATUSES.PAID;
  }
  if (normalized === "FAILED") {
    return PAYMENT_STATUSES.FAILED;
  }
  if (normalized === "PENDING") {
    return PAYMENT_STATUSES.PENDING;
  }
  return null;
}
