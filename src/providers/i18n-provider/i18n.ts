import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, LOCALES } from "@/constants/locales";
import { getClientLocale } from "@/utils/locale-cookie";
import enCommon from "@/locales/en/common.json";
import frCommon from "@/locales/fr/common.json";

export const I18N_NAMESPACES = ["common"] as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: typeof window === "undefined" ? DEFAULT_LOCALE : getClientLocale(),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    ns: [...I18N_NAMESPACES],
    defaultNS: "common",
    resources: {
      en: {
        common: enCommon,
      },
      fr: {
        common: frCommon,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });
}

i18n.addResourceBundle("en", "common", enCommon, true, true);
i18n.addResourceBundle("fr", "common", frCommon, true, true);

export { i18n };
