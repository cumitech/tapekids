import type { EventMembershipKind } from "@/constants/event-participation";
import { usesYfIdInvite } from "@/constants/event-participation";

type InviteActor = { personId?: string | null } | null | undefined;

export function inviteeIsActor(
  actor: InviteActor,
  personId?: string | null
): boolean {
  return Boolean(personId && actor?.personId === personId);
}

export function inviteAcceptMode(input: {
  kind: EventMembershipKind | null | undefined;
  alreadyThisUser: boolean;
  hasAccount: boolean;
}): { needsYfId: boolean; needsPassword: boolean } {
  const yfInvite = usesYfIdInvite(input.kind);
  const needsYfId = yfInvite && !input.alreadyThisUser;
  return {
    needsYfId,
    needsPassword: !yfInvite && !input.alreadyThisUser && !input.hasAccount,
  };
}
