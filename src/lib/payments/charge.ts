import {
  EVENT_MEMBERSHIP_KINDS,
  PAYMENT_KINDS,
  type EventMembershipKind,
  type PaymentKind,
} from "@/constants/event-participation";

type EventChargeSource = {
  requiresParticipantFee?: boolean | null;
  participantFeeAmount?: string | number | null;
  coordinatorFundAmount?: string | number | null;
  sponsorFundAmount?: string | number | null;
  currency?: string | null;
};

const CHARGE_BY_MEMBERSHIP: Record<
  EventMembershipKind,
  {
    paymentKind: PaymentKind;
    amount: (event: EventChargeSource) => number;
  }
> = {
  [EVENT_MEMBERSHIP_KINDS.CAMPER]: {
    paymentKind: PAYMENT_KINDS.PARTICIPANT_FEE,
    amount: (event) =>
      event.requiresParticipantFee ? wholeXaf(event.participantFeeAmount) : 0,
  },
  [EVENT_MEMBERSHIP_KINDS.COORDINATOR]: {
    paymentKind: PAYMENT_KINDS.COORDINATOR_FUND,
    amount: (event) => wholeXaf(event.coordinatorFundAmount),
  },
  [EVENT_MEMBERSHIP_KINDS.SPONSOR]: {
    paymentKind: PAYMENT_KINDS.SPONSOR_FUND,
    amount: (event) => wholeXaf(event.sponsorFundAmount),
  },
};

export function paymentKindForMembership(
  kind: EventMembershipKind
): PaymentKind {
  return CHARGE_BY_MEMBERSHIP[kind].paymentKind;
}

export function membershipKindFromPaymentKind(
  kind: PaymentKind
): EventMembershipKind {
  const match = (
    Object.entries(CHARGE_BY_MEMBERSHIP) as Array<
      [EventMembershipKind, (typeof CHARGE_BY_MEMBERSHIP)[EventMembershipKind]]
    >
  ).find(([, config]) => config.paymentKind === kind);
  return match?.[0] ?? EVENT_MEMBERSHIP_KINDS.CAMPER;
}

export function resolveMembershipKind(input: {
  kind?: EventMembershipKind;
  paymentKind?: PaymentKind;
}): EventMembershipKind {
  if (input.kind) {
    return input.kind;
  }
  if (input.paymentKind) {
    return membershipKindFromPaymentKind(input.paymentKind);
  }
  return EVENT_MEMBERSHIP_KINDS.CAMPER;
}

export function amountForMembership(
  event: EventChargeSource,
  kind: EventMembershipKind
): number {
  return CHARGE_BY_MEMBERSHIP[kind].amount(event);
}

export function eventCurrency(event: EventChargeSource): string {
  return (event.currency || "XAF").toUpperCase();
}

export function wholeXaf(value: string | number | null | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.round(parsed);
}

export const PAYMENT_METHODS = {
  MOMO: "momo",
  LINK: "link",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
