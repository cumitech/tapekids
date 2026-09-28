import type { Person } from "@/models/people/person.model";
import type { AuthSession } from "@/utils/auth-storage";

export type InvitePayload = {
  invitation?: { status: string; kind?: string | null };
  event?: {
    title: string;
    minAge?: number | null;
    maxAge?: number | null;
    startsAt?: string;
  };
  person?: Person | null;
  needsYfId?: boolean;
  needsPassword?: boolean;
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
