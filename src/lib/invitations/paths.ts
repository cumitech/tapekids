import type { AppLocale } from "@/constants/locales";
import { normalizeInviteToken } from "@/lib/invitations/token";

export function invitationApiPath(token: string) {
  return `/invitations/${encodeURIComponent(normalizeInviteToken(token))}`;
}

export function localizedInvitePath(locale: AppLocale, token: string) {
  return `/${locale}/invite/${encodeURIComponent(token)}`;
}
