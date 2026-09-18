import type { AppLocale } from "@/constants/locales";

export type PhoneCountry = {
  iso: string;
  dial: string;
  name: { en: string; fr: string };
};

export const DEFAULT_PHONE_COUNTRY_ISO = "CM";

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "CM", dial: "237", name: { en: "Cameroon", fr: "Cameroun" } },
  { iso: "NG", dial: "234", name: { en: "Nigeria", fr: "Nigéria" } },
  { iso: "TD", dial: "235", name: { en: "Chad", fr: "Tchad" } },
  { iso: "CF", dial: "236", name: { en: "Central African Republic", fr: "République centrafricaine" } },
  { iso: "GQ", dial: "240", name: { en: "Equatorial Guinea", fr: "Guinée équatoriale" } },
  { iso: "GA", dial: "241", name: { en: "Gabon", fr: "Gabon" } },
  { iso: "CG", dial: "242", name: { en: "Congo", fr: "Congo" } },
  { iso: "CD", dial: "243", name: { en: "DR Congo", fr: "RD Congo" } },
  { iso: "BJ", dial: "229", name: { en: "Benin", fr: "Bénin" } },
  { iso: "TG", dial: "228", name: { en: "Togo", fr: "Togo" } },
  { iso: "GH", dial: "233", name: { en: "Ghana", fr: "Ghana" } },
  { iso: "CI", dial: "225", name: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire" } },
  { iso: "SN", dial: "221", name: { en: "Senegal", fr: "Sénégal" } },
  { iso: "ML", dial: "223", name: { en: "Mali", fr: "Mali" } },
  { iso: "BF", dial: "226", name: { en: "Burkina Faso", fr: "Burkina Faso" } },
  { iso: "NE", dial: "227", name: { en: "Niger", fr: "Niger" } },
  { iso: "GN", dial: "224", name: { en: "Guinea", fr: "Guinée" } },
  { iso: "KE", dial: "254", name: { en: "Kenya", fr: "Kenya" } },
  { iso: "ZA", dial: "27", name: { en: "South Africa", fr: "Afrique du Sud" } },
  { iso: "FR", dial: "33", name: { en: "France", fr: "France" } },
  { iso: "BE", dial: "32", name: { en: "Belgium", fr: "Belgique" } },
  { iso: "CH", dial: "41", name: { en: "Switzerland", fr: "Suisse" } },
  { iso: "DE", dial: "49", name: { en: "Germany", fr: "Allemagne" } },
  { iso: "GB", dial: "44", name: { en: "United Kingdom", fr: "Royaume-Uni" } },
  { iso: "US", dial: "1", name: { en: "United States", fr: "États-Unis" } },
  { iso: "CA", dial: "1", name: { en: "Canada", fr: "Canada" } },
  { iso: "IT", dial: "39", name: { en: "Italy", fr: "Italie" } },
  { iso: "ES", dial: "34", name: { en: "Spain", fr: "Espagne" } },
  { iso: "NL", dial: "31", name: { en: "Netherlands", fr: "Pays-Bas" } },
  { iso: "PT", dial: "351", name: { en: "Portugal", fr: "Portugal" } },
  { iso: "CN", dial: "86", name: { en: "China", fr: "Chine" } },
  { iso: "IN", dial: "91", name: { en: "India", fr: "Inde" } },
  { iso: "AE", dial: "971", name: { en: "United Arab Emirates", fr: "Émirats arabes unis" } },
];

export const PHONE_COUNTRY_BY_ISO = Object.fromEntries(
  PHONE_COUNTRIES.map((country) => [country.iso, country])
) as Record<string, PhoneCountry>;

export function phoneCountryName(country: PhoneCountry, locale: AppLocale) {
  return country.name[locale] || country.name.en;
}

export function flagEmoji(iso: string) {
  return iso
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
