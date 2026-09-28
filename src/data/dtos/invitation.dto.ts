import { z } from "zod";

import { passwordPairSchema } from "@/data/dtos/password.dto";
import { requiredYfIdSchema } from "@/lib/people/yf-id";

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
