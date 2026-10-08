import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import type { AppLocale } from "@/constants/locales";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { TrophyRepository } from "@/data/repositories/trophy.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { getRequestLocale } from "@/lib/api/request-locale";
import { reportFileName, workbookBuffer, type ExcelSheetColumn } from "@/lib/export/workbook";
import { i18n } from "@/lib/i18n/instance";
import { formatPhoneDisplay } from "@/lib/phone";
import type { TrophyEntry, TrophyStats } from "@/models/trophy/trophy.model";

const trophyRepository = new TrophyRepository();

export class TrophyService {
  async list(
    query: ListQuery,
    locale?: AppLocale
  ): Promise<PaginatedResult<TrophyEntry>> {
    const result = await trophyRepository.listAccepted(query);
    const eventTitles = await this.resolveEventTitles(
      result.data.map((r) => r.event).filter(Boolean),
      locale
    );

    const data: TrophyEntry[] = result.data.map((row) => ({
      id: row.id,
      personId: row.personId,
      eventId: row.eventId,
      batchId: row.batchId,
      fullName: row.person?.fullName ?? "",
      yfId: row.person?.yfId ?? null,
      email: row.person?.email || row.emailSnapshot || "",
      phone: row.person?.phone ?? null,
      category: row.person?.category ?? null,
      eventTitle: eventTitles.get(row.eventId) || row.event?.title || "",
      sentAt: row.sentAt ? new Date(row.sentAt).toISOString() : null,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt).toISOString() : null,
      status: row.status,
    }));

    return {
      data,
      total: result.total,
      offset: result.offset,
      limit: result.limit,
    };
  }

  async stats(): Promise<TrophyStats> {
    const raw = await trophyRepository.stats();
    const rate =
      raw.invitationsSent > 0
        ? `${((raw.registered / raw.invitationsSent) * 100).toFixed(1)}%`
        : "0%";

    return {
      registered: raw.registered,
      invitationsSent: raw.invitationsSent,
      uniquePeople: raw.uniquePeople,
      responseRate: rate,
    };
  }

  async exportWorkbook(locale?: AppLocale) {
    const currentLocale = locale ?? getRequestLocale();
    const translate = i18n.getFixedT(currentLocale);
    const rows = await trophyRepository.listAllAccepted();
    const eventTitles = await this.resolveEventTitles(
      rows.map((r) => r.event).filter(Boolean),
      currentLocale
    );

    const sheetName = translate("trophy.titles.list", "Trophy");
    const filename = reportFileName("trophy");

    const columns: ExcelSheetColumn[] = [
      { header: translate("trophy.fields.event", "Event"), width: 32 },
      { header: translate("trophy.fields.fullName", "Full name"), width: 28 },
      { header: translate("trophy.fields.yfId", "YF ID"), width: 16 },
      { header: translate("trophy.fields.email", "Email"), width: 32 },
      { header: translate("trophy.fields.phone", "Phone"), width: 20 },
      { header: translate("trophy.fields.category", "Category"), width: 22 },
      { header: translate("trophy.fields.sentAt", "Invitation sent"), width: 22 },
      { header: translate("trophy.fields.registeredAt", "Registered at"), width: 22 },
      { header: translate("trophy.fields.status", "Status"), width: 14 },
    ];

    const dataRows = rows.map((row) => {
      const categoryKey = row.person?.category
        ? `people.categories.${row.person.category}`
        : "";
      const categoryLabel = categoryKey
        ? translate(categoryKey, row.person?.category ?? "")
        : "";

      return [
        eventTitles.get(row.eventId) || row.event?.title || "",
        row.person?.fullName ?? "",
        row.person?.yfId ?? "",
        row.person?.email || row.emailSnapshot || "",
        formatPhoneDisplay(row.person?.phone) || row.person?.phone || "",
        categoryLabel,
        row.sentAt ? new Date(row.sentAt) : "",
        row.acceptedAt ? new Date(row.acceptedAt) : "",
        translate("trophy.status.registered", "Registered"),
      ];
    });

    return {
      filename,
      buffer: workbookBuffer([
        {
          name: sheetName,
          columns,
          rows: dataRows,
        },
      ]),
    };
  }

  private async resolveEventTitles(
    events: Array<{ id: string; title: string } | undefined>,
    locale?: AppLocale
  ) {
    const seen = new Set<string>();
    const list = [];
    for (const e of events) {
      if (e && !seen.has(e.id)) {
        seen.add(e.id);
        list.push(e);
      }
    }
    const localized = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.event,
      list,
      locale ?? getRequestLocale()
    );
    return new Map(localized.map((ev) => [ev.id, ev.title ?? ""]));
  }
}

export const trophyService = new TrophyService();
