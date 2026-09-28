import { createInstance } from "i18next";

import { DEFAULT_LOCALE, LOCALES } from "@/constants/locales";
import enCommon from "@/locales/en/common.json";
import frCommon from "@/locales/fr/common.json";

/** Server-safe translations. The browser provider adds React on top of its own instance. */
export const i18n = createInstance();

void i18n.init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...LOCALES],
  ns: ["common"],
  defaultNS: "common",
  resources: {
    fr: { common: frCommon },
    en: { common: enCommon },
  },
  interpolation: {
    escapeValue: false,
  },
});
