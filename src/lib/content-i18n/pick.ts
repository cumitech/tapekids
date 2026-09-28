import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import { isEmptyHtml } from "@/lib/html";

export type TranslationsBag = Partial<
  Record<AppLocale, Partial<Record<string, string>> | undefined>
>;

type FieldOptions = { html?: boolean };

/** Prefer default locale, then any other filled locale. */
export function localesPreferDefault(): AppLocale[] {
  return [
    DEFAULT_LOCALE,
    ...LOCALES.filter((locale) => locale !== DEFAULT_LOCALE),
  ];
}

export function isHtmlContentField(field: string): boolean {
  return field === "description" || field === "body";
}

export function isFilledContentField(
  field: string,
  value: unknown,
  options?: FieldOptions
): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const treatAsHtml = options?.html || isHtmlContentField(field);
  return treatAsHtml ? !isEmptyHtml(value) : value.trim().length > 0;
}

function normalizeFilled(
  field: string,
  value: string,
  options?: FieldOptions
): string {
  const treatAsHtml = options?.html || isHtmlContentField(field);
  return treatAsHtml ? value : value.trim();
}

/** Prefer default locale, then any other filled locale, then root fallback. */
export function pickTranslatedField(
  translations: TranslationsBag | null | undefined,
  field: string,
  rootFallback?: unknown,
  options?: FieldOptions & { prefer?: AppLocale }
): string {
  const order = options?.prefer
    ? [
        options.prefer,
        ...localesPreferDefault().filter((locale) => locale !== options.prefer),
      ]
    : localesPreferDefault();

  for (const locale of order) {
    const value = translations?.[locale]?.[field];
    if (isFilledContentField(field, value, options)) {
      return normalizeFilled(field, value, options);
    }
  }
  if (isFilledContentField(field, rootFallback, options)) {
    return normalizeFilled(field, rootFallback, options);
  }
  return "";
}

export function hasTranslatedField(
  translations: TranslationsBag | null | undefined,
  field: string,
  rootFallback?: unknown,
  options?: FieldOptions & { prefer?: AppLocale }
): boolean {
  return Boolean(pickTranslatedField(translations, field, rootFallback, options));
}

/**
 * Value for one locale. Root fields are used for the default locale
 * (or always when `alwaysUseRoot` is set).
 */
export function fieldForLocale(
  translations: TranslationsBag | null | undefined,
  locale: AppLocale,
  field: string,
  rootFallback?: string | null,
  options?: FieldOptions & { alwaysUseRoot?: boolean }
): string {
  const translated = translations?.[locale]?.[field];
  if (isFilledContentField(field, translated, options)) {
    return normalizeFilled(field, translated, options);
  }
  const useRoot = options?.alwaysUseRoot || locale === DEFAULT_LOCALE;
  if (useRoot && isFilledContentField(field, rootFallback, options)) {
    return normalizeFilled(field, rootFallback, options);
  }
  if (options?.alwaysUseRoot && typeof rootFallback === "string") {
    return rootFallback;
  }
  return "";
}

export function copyFieldsForLocale<T extends string>(
  translations: TranslationsBag | null | undefined,
  locale: AppLocale,
  fields: readonly T[],
  roots: Partial<Record<T, string | null | undefined>>,
  options?: FieldOptions & { alwaysUseRoot?: boolean }
): Record<T, string> {
  return Object.fromEntries(
    fields.map((field) => [
      field,
      fieldForLocale(translations, locale, field, roots[field], options),
    ])
  ) as Record<T, string>;
}

export function copiesByLocale<T extends string>(
  translations: TranslationsBag | null | undefined,
  fields: readonly T[],
  roots: Partial<Record<T, string | null | undefined>>,
  options?: FieldOptions & { alwaysUseRoot?: boolean }
): Record<AppLocale, Record<T, string>> {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      copyFieldsForLocale(translations, locale, fields, roots, options),
    ])
  ) as Record<AppLocale, Record<T, string>>;
}

/** Prefer a locale map entry, then fall through default → others. */
export function pickFromLocaleMap(
  map: Partial<Record<AppLocale, string>> | null | undefined,
  preferred?: AppLocale,
  options?: FieldOptions
): string {
  return pickTranslatedField(
    Object.fromEntries(
      LOCALES.map((locale) => [locale, { value: map?.[locale] ?? "" }])
    ),
    "value",
    undefined,
    { ...options, prefer: preferred, html: options?.html }
  );
}

export function emptyTranslationsForm<T extends Record<string, string>>(
  emptyCopy: T
): Record<AppLocale, T> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...emptyCopy }])
  ) as Record<AppLocale, T>;
}

export function translationsPayload(
  translations: Partial<Record<AppLocale, unknown>> | null | undefined
) {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, translations?.[locale]])
  );
}

/**
 * RHF rule: only the default-locale tab reports errors, but any filled
 * locale satisfies the requirement (matches server pickTranslatedField).
 */
export function requireAnyLocaleField(
  locale: AppLocale,
  field: string,
  message: string,
  options?: FieldOptions
) {
  return {
    validate: (
      _value: unknown,
      values: { translations?: TranslationsBag | null }
    ) =>
      locale !== DEFAULT_LOCALE ||
      hasTranslatedField(values.translations, field, undefined, options) ||
      message,
  };
}
