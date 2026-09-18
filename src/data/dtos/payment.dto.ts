import { z } from "zod";

import { PAYMENT_STATUSES } from "@/constants/event-participation";
import {
  membershipKindSchema,
  paymentKindSchema,
  paymentMethodSchema,
} from "@/data/dtos/event-participation.dto";
import { PAYMENT_METHODS } from "@/lib/payments/charge";

export const initiatePaymentSchema = z.object({
  eventId: z.string().trim().min(1),
  personId: z.string().trim().min(1),
  kind: membershipKindSchema.optional(),
  paymentKind: paymentKindSchema.optional(),
  method: paymentMethodSchema.default(PAYMENT_METHODS.MOMO),
  phone: z.string().trim().min(1).optional(),
  redirectPath: z.string().trim().min(1).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum([
    PAYMENT_STATUSES.PAID,
    PAYMENT_STATUSES.WAIVED,
    PAYMENT_STATUSES.FAILED,
  ]),
});

export type InitiatePayment = z.infer<typeof initiatePaymentSchema>;
export type UpdatePaymentStatus = z.infer<typeof updatePaymentStatusSchema>;

export function parseInitiatePayment(body: unknown): InitiatePayment {
  return initiatePaymentSchema.parse(body);
}

export function parseUpdatePaymentStatus(body: unknown): UpdatePaymentStatus {
  return updatePaymentStatusSchema.parse(body);
}
