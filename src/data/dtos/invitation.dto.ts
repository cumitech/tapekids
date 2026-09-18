import { passwordPairSchema } from "@/data/dtos/password.dto";

export function parseAcceptInvitation(body: unknown) {
  const { password } = passwordPairSchema.parse(body);
  return { password };
}
