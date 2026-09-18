"use client";

import type { I18nProvider } from "@refinedev/core";

import { DEFAULT_LOCALE } from "@/constants/locales";
import { isAppLocale, localeFromPathname, replacePathLocale } from "@/lib/locale";
import { setLocaleCookie } from "@/utils/locale-cookie";
import { I18N_NAMESPACES, i18n } from "@/providers/i18n-provider/i18n";
import { getCurrentLocale } from "@/providers/i18n-provider/locale-state";
import { store } from "@/redux/store";
import { setLocale } from "@/redux/slices/ui-preferences.slice";

function resolveTranslateKey(key: string): { ns: string; lookup: string } {
  const separator = key.indexOf(".");
  if (separator === -1) {
    return { ns: "common", lookup: key };
  }

  const ns = key.slice(0, separator);
  if (I18N_NAMESPACES.includes(ns as (typeof I18N_NAMESPACES)[number])) {
    return { ns, lookup: key.slice(separator + 1) };
  }

  return { ns: "common", lookup: key };
}

function activeLocale() {
  if (typeof window !== "undefined") {
    return localeFromPathname(window.location.pathname);
  }

  return getCurrentLocale();
}

export const i18nProvider: I18nProvider = {
  translate: (key, options, defaultMessage) => {
    const { ns, lookup } = resolveTranslateKey(key);
    const fallback =
      typeof options === "string"
        ? options
        : defaultMessage ?? key;
    const interpolation =
      typeof options === "object" && options ? options : {};

    const translated = i18n.t(lookup, {
      ns,
      lng: activeLocale(),
      defaultValue: fallback,
      ...(interpolation as Record<string, unknown>),
    });

    return typeof translated === "string" ? translated : key;
  },
  changeLocale: async (lang: string) => {
    const locale = isAppLocale(lang) ? lang : DEFAULT_LOCALE;
    await i18n.changeLanguage(locale);
    store.dispatch(setLocale(locale));
    setLocaleCookie(locale);

    if (typeof window === "undefined") {
      return;
    }

    const nextPath = replacePathLocale(window.location.pathname, locale);
    const nextUrl = `${nextPath}${window.location.search}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.location.assign(nextUrl);
    }
  },
  getLocale: () => activeLocale(),
};

export { i18n };
