import { z } from "zod";

import { createPersonSchema } from "@/data/dtos/person.dto";
import { isStandardEmail, normalizeEmail } from "@/lib/email";

const requiredEmail = z.string().trim().transform((value, ctx) => {
  const email = normalizeEmail(value);
  if (!email || !isStandardEmail(email, 128)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid email",
    });
    return z.NEVER;
  }
  return email;
});

export const registerWaitingListSchema = createPersonSchema.extend({
  email: requiredEmail,
  eventId: z.string().trim().max(20).optional(),
  eventTitle: z.string().trim().max(128).optional(),
});

export const approveWaitingListSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(20)).min(1).max(100),
});

export type RegisterWaitingList = z.infer<typeof registerWaitingListSchema>;

export function parseRegisterWaitingList(body: unknown): RegisterWaitingList {
  return registerWaitingListSchema.parse(body);
}

export function parseApproveWaitingList(body: unknown): string[] {
  return approveWaitingListSchema.parse(body).ids;
}
