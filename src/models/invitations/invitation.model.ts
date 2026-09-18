import type { Person } from "@/models/people/person.model";
import type { AuthSession } from "@/utils/auth-storage";

export type InvitePayload = {
  invitation?: { status: string };
  event?: { title: string };
  person?: Person | null;
  accountCreated?: boolean;
  token?: string;
  user?: AuthSession["user"];
};

export function sessionFromInvite(payload: InvitePayload): AuthSession | null {
  if (!payload.token || !payload.user) {
    return null;
  }
  return { token: payload.token, user: payload.user };
}
