import type { EventMembershipKind } from "@/constants/event-participation";
import { campayConfig } from "@/lib/integrations/campay.config";
import { amountForMembership } from "@/lib/payments/charge";

const MIN_TEST_AMOUNT = 2;

type EventChargeSource = Parameters<typeof amountForMembership>[0];

export function isLivePaymentPricing() {
  return campayConfig().environment === "PROD";
}

export function testChargeAmount() {
  const parsed = campayConfig().testAmount;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return MIN_TEST_AMOUNT;
  }
  return Math.max(MIN_TEST_AMOUNT, Math.round(parsed));
}

export function chargeAmountForMembership(
  event: EventChargeSource,
  kind: EventMembershipKind
) {
  if (isLivePaymentPricing()) {
    return amountForMembership(event, kind);
  }
  return testChargeAmount();
}
