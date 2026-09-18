import { Op } from "sequelize";

import {
  CONTENT_FIELDS,
  emptyTranslations,
  type ContentEntityType,
  type TranslationsByLocale,
} from "@/constants/content-i18n";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import { ContentTranslation } from "@/data/entities";
import { nanoid } from "@/lib/api/id";
import { isEmptyHtml } from "@/lib/html";

export type LocalizedRecord<T> = T & {
  locale: AppLocale;
  translations?: Record<AppLocale, Record<string, string>>;
};

function isFilled(field: string, value: string) {
  if (field === "description" || field === "body") {
    return !isEmptyHtml(value);
  }
  return value.trim().length > 0;
}

function asPlain<T>(record: T): T {
  const maybe = record as { toJSON?: () => T };
  return typeof maybe.toJSON === "function" ? maybe.toJSON() : record;
}

export class ContentTranslationRepository {
  async listFor(entityType: ContentEntityType, entityIds: string[]) {
    if (entityIds.length === 0) {
      return [];
    }

    return ContentTranslation.findAll({
      where: {
        entityType,
        entityId: { [Op.in]: entityIds },
      },
    });
  }

  async replace(
    entityType: ContentEntityType,
    entityId: string,
    translations: TranslationsByLocale
  ) {
    const fields = CONTENT_FIELDS[entityType];
    const rows: Array<{
      id: string;
      entityType: ContentEntityType;
      entityId: string;
      locale: AppLocale;
      field: string;
      value: string;
    }> = [];

    for (const locale of LOCALES) {
      const copy = translations[locale] ?? {};
      for (const field of fields) {
        const value = copy[field];
        if (typeof value !== "string" || !isFilled(field, value)) {
          continue;
        }
        rows.push({
          id: nanoid(),
          entityType,
          entityId,
          locale,
          field,
          value: field === "description" || field === "body" ? value : value.trim(),
        });
      }
    }

    await ContentTranslation.destroy({
      where: { entityType, entityId },
    });

    if (rows.length > 0) {
      await ContentTranslation.bulkCreate(rows);
    }
  }

  async deleteFor(entityType: ContentEntityType, entityId: string) {
    await ContentTranslation.destroy({
      where: { entityType, entityId },
    });
  }

  async localize<T extends { id: string }>(
    entityType: ContentEntityType,
    records: T[],
    locale: AppLocale,
    includeAll = false
  ): Promise<Array<LocalizedRecord<T>>> {
    const fields = CONTENT_FIELDS[entityType];
    const rows = await this.listFor(
      entityType,
      records.map((record) => record.id)
    );

    const byEntity = new Map<string, Record<AppLocale, Record<string, string>>>();
    for (const row of rows) {
      const current = byEntity.get(row.entityId) ?? emptyTranslations();
      current[row.locale] = {
        ...current[row.locale],
        [row.field]: row.value,
      };
      byEntity.set(row.entityId, current);
    }

    return records.map((record) => {
      const resolved: Record<string, unknown> = {
        ...(asPlain(record) as object),
      };
      const translations = byEntity.get(record.id) ?? emptyTranslations();

      for (const field of fields) {
        const fromLocale = translations[locale]?.[field];
        const fromDefault = translations[DEFAULT_LOCALE]?.[field];
        const fromParent = resolved[field];
        resolved[field] =
          (fromLocale && isFilled(field, fromLocale) ? fromLocale : undefined) ??
          (fromDefault && isFilled(field, fromDefault) ? fromDefault : undefined) ??
          fromParent;
      }

      return {
        ...resolved,
        locale,
        ...(includeAll ? { translations } : {}),
      } as LocalizedRecord<T>;
    });
  }

  overlay(
    records: Array<{ id: string } | null | undefined>,
    localized: Array<{ id: string }>,
    entityType: ContentEntityType
  ) {
    const fields = CONTENT_FIELDS[entityType];
    const byId = new Map(localized.map((item) => [item.id, item as Record<string, unknown>]));
    for (const record of records) {
      if (!record) {
        continue;
      }
      const copy = byId.get(record.id);
      if (!copy) {
        continue;
      }
      const writable = record as unknown as Record<string, unknown>;
      for (const field of fields) {
        const value = copy[field];
        if (typeof value !== "string") {
          continue;
        }
        writable[field] = value;
        const model = record as {
          setDataValue?: (key: string, next: string) => void;
        };
        model.setDataValue?.(field, value);
      }
    }
  }
}

export const contentTranslationRepository = new ContentTranslationRepository();
