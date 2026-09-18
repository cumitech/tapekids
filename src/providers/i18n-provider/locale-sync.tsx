"use client";

import { useLayoutEffect, type PropsWithChildren } from "react";

import type { AppLocale } from "@/constants/locales";
import { i18n } from "@/providers/i18n-provider/i18n";
import { setCurrentLocale } from "@/providers/i18n-provider/locale-state";
import { useAppDispatch } from "@/redux/hooks";
import { setLocale } from "@/redux/slices/ui-preferences.slice";
import { setLocaleCookie } from "@/utils/locale-cookie";

type AppLocaleProviderProps = PropsWithChildren<{
  lang: AppLocale;
}>;

export function AppLocaleProvider({ lang, children }: AppLocaleProviderProps) {
  const dispatch = useAppDispatch();

  setCurrentLocale(lang);

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    dispatch(setLocale(lang));
    setLocaleCookie(lang);
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [dispatch, lang]);

  return children;
}
