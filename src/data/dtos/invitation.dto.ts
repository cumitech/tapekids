import { z } from "zod";

import { passwordPairSchema } from "@/data/dtos/password.dto";
import { requiredYfIdSchema } from "@/lib/people/yf-id";

const resendInvitationsSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(20)).min(1).max(500),
});

const recipientEmailSchema = z.object({
  email: z.string(),
});

const acceptInvitationSchema = z
  .object({
    yfId: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .passthrough();

export function parseAcceptInvitation(body: unknown) {
  return acceptInvitationSchema.parse(body ?? {});
}

export function parseNewInvitePassword(body: unknown) {
  const { password } = passwordPairSchema.parse(body);
  return { password };
}

export function parseInviteYfId(body: unknown) {
  return z.object({ yfId: requiredYfIdSchema }).parse(body ?? {});
}

export function parseResendInvitations(body: unknown) {
  return resendInvitationsSchema.parse(body ?? {});
}

export function parseRecipientEmail(body: unknown) {
  return recipientEmailSchema.parse(body ?? {});
}
