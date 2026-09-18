import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && LOCALES.includes(value as AppLocale);
}

export function localeOrDefault(value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function negotiateLocale(preferred?: string | null): AppLocale {
  if (!preferred) {
    return DEFAULT_LOCALE;
  }

  const candidates = preferred
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter((part): part is string => Boolean(part));

  for (const candidate of candidates) {
    const base = candidate.split("-")[0];
    if (isAppLocale(base)) {
      return base;
    }
  }

  return DEFAULT_LOCALE;
}

export function localeFromPathname(pathname: string): AppLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isAppLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }

  if (isAppLocale(segments[0])) {
    const rest = segments.slice(1);
    return rest.length === 0 ? "/" : `/${rest.join("/")}`;
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function withLocalePath(locale: AppLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = stripLocalePrefix(normalized);
  if (withoutLocale === "/") {
    return `/${locale}`;
  }

  return `/${locale}${withoutLocale}`;
}

export function replacePathLocale(
  pathname: string,
  locale: AppLocale
): string {
  return withLocalePath(locale, stripLocalePrefix(pathname));
}

export function localizeResourcePath(
  locale: AppLocale,
  path: unknown
): unknown {
  if (typeof path !== "string") {
    return path;
  }

  return withLocalePath(locale, path);
}
