import {
  CONTENT_FIELDS,
  emptyTranslations,
  type ContentEntityType,
  type TranslationsByLocale,
} from "@/constants/content-i18n";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import { isEmptyHtml } from "@/lib/html";

type TranslationInput = {
  translations?: TranslationsByLocale | null;
} & Record<string, unknown>;

function filled(field: string, value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  if (field === "description" || field === "body") {
    return !isEmptyHtml(value);
  }
  return value.trim().length > 0;
}

export function translationsFromInput(
  entityType: ContentEntityType,
  input: TranslationInput,
  parentFallback: Record<string, string | null | undefined>
): TranslationsByLocale {
  const fields = CONTENT_FIELDS[entityType];
  const result = emptyTranslations();

  for (const field of fields) {
    const fallback = parentFallback[field];
    if (filled(field, fallback)) {
      result[DEFAULT_LOCALE][field] = fallback;
    }
  }

  for (const locale of LOCALES) {
    const copy = input.translations?.[locale];
    if (!copy) {
      continue;
    }
    for (const field of fields) {
      const value = copy[field];
      if (filled(field, value)) {
        result[locale][field] =
          field === "description" || field === "body" ? value : value.trim();
      }
    }
  }

  return result;
}

export function defaultLocaleCopy(
  translations: TranslationsByLocale,
  parentFallback: Record<string, string | null | undefined>
): Record<string, string> {
  const locale = DEFAULT_LOCALE as AppLocale;
  const copy = translations[locale] ?? {};
  const merged: Record<string, string> = {};
  for (const [field, value] of Object.entries(parentFallback)) {
    merged[field] = copy[field] || (typeof value === "string" ? value : "");
  }
  return merged;
}
