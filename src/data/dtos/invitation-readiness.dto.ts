import { z } from "zod";

export const invitationReadinessSchema = z.object({
  mailingListId: z.string().trim().min(1),
});

export function parseInvitationReadiness(body: unknown) {
  return invitationReadinessSchema.parse(body ?? {});
}
