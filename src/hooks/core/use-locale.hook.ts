"use client";

import { useParams, usePathname } from "next/navigation";

import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { isAppLocale, localeFromPathname, withLocalePath } from "@/lib/locale";

export function useLocale() {
  const params = useParams();
  const pathname = usePathname();
  const rawLang = params?.lang;
  const paramLang = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  const locale: AppLocale = isAppLocale(paramLang)
    ? paramLang
    : localeFromPathname(pathname ?? "/");

  return {
    locale: locale || DEFAULT_LOCALE,
    path: (suffix: string) => withLocalePath(locale || DEFAULT_LOCALE, suffix),
  };
}
