import type { AppLocale } from "@/constants/locales";

const DAY_MS = 24 * 60 * 60 * 1000;

export const INVITATION_TTL_DAYS = 30;

export function invitationExpiresAt(from: Date = new Date()) {
  return new Date(from.getTime() + INVITATION_TTL_DAYS * DAY_MS);
}

/** Adds another 30 days after the current expiry, or from now if it has already passed. */
export function extendedInvitationExpiry(
  current: Date | string | null | undefined,
  from: Date = new Date()
) {
  const currentTime = current ? new Date(current).getTime() : 0;
  const start = Number.isFinite(currentTime) && currentTime > from.getTime()
    ? currentTime
    : from.getTime();
  return new Date(start + INVITATION_TTL_DAYS * DAY_MS);
}

export function isInvitationExpired(
  expiresAt: Date | string | null | undefined
) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export function invitationLinkValidityCopy(locale: AppLocale) {
  return locale === "fr"
    ? `Ce lien d'invitation est valable ${INVITATION_TTL_DAYS} jours.`
    : `This invitation link is valid for ${INVITATION_TTL_DAYS} days.`;
}
