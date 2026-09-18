import { STORAGE_KEYS } from "@/constants/storage-keys";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { isAppLocale, negotiateLocale } from "@/lib/locale";
import { getRequestContext } from "@/lib/api/request-context";

export function localeFromRequest(request: Request): AppLocale {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get("locale");
  if (isAppLocale(queryLocale)) {
    return queryLocale;
  }

  const headerLocale = request.headers.get("x-app-locale");
  if (isAppLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieLocale = cookieValue(
    request.headers.get("cookie"),
    STORAGE_KEYS.LOCALE
  );
  if (isAppLocale(cookieLocale)) {
    return cookieLocale;
  }

  return negotiateLocale(request.headers.get("accept-language"));
}

export function getRequestLocale(): AppLocale {
  const locale = getRequestContext()?.locale;
  return isAppLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function resolveContentLocale(explicit?: string | null): AppLocale {
  return isAppLocale(explicit) ? explicit : getRequestLocale();
}

function cookieValue(header: string | null, name: string): string | null {
  if (!header) {
    return null;
  }

  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
