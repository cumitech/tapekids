import { z } from "zod";

import { passwordPairSchema } from "@/data/dtos/password.dto";

const acceptInvitationSchema = z
  .object({
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
