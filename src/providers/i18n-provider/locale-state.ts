import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { isAppLocale } from "@/lib/locale";

let currentLocale: AppLocale = DEFAULT_LOCALE;

export function setCurrentLocale(locale: AppLocale) {
  currentLocale = locale;
}

export function getCurrentLocale(): AppLocale {
  return isAppLocale(currentLocale) ? currentLocale : DEFAULT_LOCALE;
}
