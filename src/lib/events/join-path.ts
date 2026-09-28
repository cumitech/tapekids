import type { AppLocale } from "@/constants/locales";

export function localizedJoinPath(locale: AppLocale, token: string) {
  return `/${locale}/join/${encodeURIComponent(token)}`;
}
