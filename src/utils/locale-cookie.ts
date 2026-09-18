import { STORAGE_KEYS } from "@/constants/storage-keys";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { isAppLocale, localeFromPathname } from "@/lib/locale";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function canUseDocument(): boolean {
  return typeof document !== "undefined";
}

export function getLocaleCookie(): AppLocale | null {
  if (!canUseDocument()) {
    return null;
  }

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STORAGE_KEYS.LOCALE}=`));

  const value = match?.slice(`${STORAGE_KEYS.LOCALE}=`.length);
  return isAppLocale(value) ? value : null;
}

export function setLocaleCookie(locale: AppLocale): void {
  if (!canUseDocument()) {
    return;
  }

  document.cookie = `${STORAGE_KEYS.LOCALE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function getClientLocale(): AppLocale {
  if (typeof window !== "undefined") {
    return localeFromPathname(window.location.pathname);
  }

  return getLocaleCookie() ?? DEFAULT_LOCALE;
}
