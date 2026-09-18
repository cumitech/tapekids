import { LOCALES, type AppLocale } from "@/constants/locales";

export const CONTENT_ENTITY_TYPES = {
  event: "event",
  mailingList: "mailing_list",
  invitationBatch: "invitation_batch",
} as const;

export type ContentEntityType =
  (typeof CONTENT_ENTITY_TYPES)[keyof typeof CONTENT_ENTITY_TYPES];

export const CONTENT_FIELDS = {
  event: ["title", "summary", "description", "venue"],
  mailing_list: ["name", "description"],
  invitation_batch: ["subject", "body"],
} as const;

export type ContentFieldMap = {
  event: (typeof CONTENT_FIELDS)["event"][number];
  mailing_list: (typeof CONTENT_FIELDS)["mailing_list"][number];
  invitation_batch: (typeof CONTENT_FIELDS)["invitation_batch"][number];
};

export type LocaleCopy = Record<string, string>;

export type TranslationsByLocale = Partial<Record<AppLocale, LocaleCopy>>;

export function emptyLocaleCopy(): LocaleCopy {
  return {};
}

export function emptyTranslations(): Record<AppLocale, LocaleCopy> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, {}])) as Record<
    AppLocale,
    LocaleCopy
  >;
}
