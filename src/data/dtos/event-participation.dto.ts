import { z } from "zod";

import {
  EVENT_MEMBERSHIP_KINDS,
  PAYMENT_KINDS,
  type EventMembershipKind,
  type PaymentKind,
} from "@/constants/event-participation";
import { PAYMENT_METHODS } from "@/lib/payments/charge";

const membershipKindValues = Object.values(EVENT_MEMBERSHIP_KINDS) as [
  EventMembershipKind,
  ...EventMembershipKind[],
];

const paymentKindValues = Object.values(PAYMENT_KINDS) as [
  PaymentKind,
  ...PaymentKind[],
];

export const membershipKindSchema = z.enum(membershipKindValues);
export const paymentKindSchema = z.enum(paymentKindValues);
export const paymentMethodSchema = z.enum([
  PAYMENT_METHODS.MOMO,
  PAYMENT_METHODS.LINK,
]);
