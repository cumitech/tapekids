import {
  CONTENT_FIELDS,
  emptyTranslations,
  type ContentEntityType,
  type TranslationsByLocale,
} from "@/constants/content-i18n";
import { DEFAULT_LOCALE, LOCALES } from "@/constants/locales";
import {
  isFilledContentField,
  isHtmlContentField,
  pickTranslatedField,
} from "@/lib/content-i18n/pick";

type TranslationInput = {
  translations?: TranslationsByLocale | null;
} & Record<string, unknown>;

export function translationsFromInput(
  entityType: ContentEntityType,
  input: TranslationInput,
  parentFallback: Record<string, string | null | undefined>
): TranslationsByLocale {
  const fields = CONTENT_FIELDS[entityType];
  const result = emptyTranslations();

  for (const field of fields) {
    const fallback = parentFallback[field];
    if (isFilledContentField(field, fallback)) {
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
      if (isFilledContentField(field, value)) {
        result[locale][field] = isHtmlContentField(field) ? value : value.trim();
      }
    }
  }

  return result;
}

export function defaultLocaleCopy(
  translations: TranslationsByLocale,
  parentFallback: Record<string, string | null | undefined>
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const [field, value] of Object.entries(parentFallback)) {
    merged[field] =
      pickTranslatedField(translations, field, value) ||
      (typeof value === "string" ? value : "");
  }
  return merged;
}
