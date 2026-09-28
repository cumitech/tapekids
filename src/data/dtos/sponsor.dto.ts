import { z } from "zod";

import { paymentMethodSchema } from "@/data/dtos/event-participation.dto";
import { SPONSOR_AMOUNT_XAF } from "@/constants/sponsor";
import { PAYMENT_METHODS } from "@/lib/payments/charge";

export const registerSponsorSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(128).toLowerCase(),
  phone: z.string().trim().max(24).optional().nullable(),
  anonymous: z.boolean().default(false),
  eventId: z.string().trim().min(1),
  paymentPhone: z.string().trim().min(1).max(24),
  amount: z.coerce
    .number()
    .int()
    .min(SPONSOR_AMOUNT_XAF, {
      message: `Amount must be at least ${SPONSOR_AMOUNT_XAF} XAF.`,
    }),
  method: paymentMethodSchema.default(PAYMENT_METHODS.MOMO),
});

export type RegisterSponsor = z.infer<typeof registerSponsorSchema>;

export function parseRegisterSponsor(body: unknown): RegisterSponsor {
  return registerSponsorSchema.parse(body);
}
