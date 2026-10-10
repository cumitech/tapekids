import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import type { AppLocale } from "@/constants/locales";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { TrophyRepository } from "@/data/repositories/trophy.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { getRequestLocale } from "@/lib/api/request-locale";
import {
  reportFileName,
  workbookBuffer,
  type ExcelCell,
  type ExcelSheetColumn,
} from "@/lib/export/workbook";
import { i18n } from "@/lib/i18n/instance";
import { personDisplayName } from "@/lib/people/display-name";
import { formatPhoneDisplay } from "@/lib/phone";
import {
  resolveDateOfBirth,
  resolveInvitationSent,
  resolveRegisteredAt,
} from "@/lib/reports/person-export";
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

    // 1. Avoid duplicate registrations for the same person and event (keep the latest accepted invitation)
    const seenRegistrations = new Set<string>();
    const deduplicatedInvitations: typeof rows = [];
    for (const row of rows) {
      const regKey = `${row.personId}::${row.eventId || ""}`;
      if (!seenRegistrations.has(regKey)) {
        seenRegistrations.add(regKey);
        deduplicatedInvitations.push(row);
      }
    }

    const eventTitles = await this.resolveEventTitles(
      deduplicatedInvitations.map((r) => r.event).filter(Boolean),
      currentLocale
    );

    const sheetName = translate("trophy.titles.list", "Trophy");
    const filename = reportFileName("trophy");

    const guardianHeader = translate("people.guardians", "Parent / Guardian");
    const guardianNameLabel = translate(
      "people.fields.parentGuardianName",
      "Name"
    );
    const guardianPhoneLabel = translate(
      "people.fields.parentGuardianPhone",
      "Phone"
    );

    const columns: ExcelSheetColumn[] = [
      // 1-15: All 15 fields matching trophy participants export (/dashboard/reports/trophy-participants)
      { header: translate("events.fields.title", "Event"), width: 32 },
      { header: translate("payments.fields.status", "Status"), width: 14 },
      { header: translate("people.fields.yfId", "YF ID"), width: 16 },
      { header: translate("people.fields.fullName", "Full name"), width: 28 },
      { header: translate("people.fields.email", "Email"), width: 28 },
      { header: translate("people.fields.gender", "Gender"), width: 12 },
      { header: translate("people.fields.shirtSize", "Shirt size"), width: 18 },
      { header: translate("people.fields.phone", "Phone"), width: 18 },
      { header: translate("people.fields.dateOfBirth", "Date of birth"), width: 14 },
      { header: translate("people.fields.region", "Region"), width: 18 },
      { header: translate("people.fields.town", "Town"), width: 16 },
      { header: translate("people.fields.address", "Address"), width: 32 },
      { header: translate("people.fields.category", "Category"), width: 22 },
      { header: translate("people.fields.points", "Points"), width: 10 },
      { header: translate("people.fields.ageYears", "Age"), width: 8 },
      // 16-17: Invitation timestamps
      { header: translate("trophy.fields.sentAt", "Invitation sent"), width: 22 },
      { header: translate("trophy.fields.registeredAt", "Registered at"), width: 22 },
      // 18-26: User / person information (no country column)
      { header: translate("people.fields.division", "Division"), width: 18 },
      { header: translate("people.fields.subDivision", "Sub-division"), width: 18 },
      { header: translate("people.fields.churchName", "Church name"), width: 24 },
      {
        header: translate("people.fields.churchPastorName", "Pastor's name"),
        width: 24,
      },
      {
        header: translate("people.fields.churchAddress", "Church address"),
        width: 32,
      },
      { header: `${guardianHeader} - ${guardianNameLabel}`, width: 24 },
      { header: `${guardianHeader} - ${guardianPhoneLabel}`, width: 18 },
      {
        header: translate("people.fields.medicalNotes", "Medical notes"),
        width: 30,
      },
      { header: translate("people.fields.isTrophy", "Trophies"), width: 12 },
    ];

    // 2. Build rows and avoid any entire row duplications
    const seenSignatures = new Set<string>();
    const dataRows: ExcelCell[][] = [];

    for (const row of deduplicatedInvitations) {
      const person = row.person;
      const categoryKey = person?.category
        ? `people.categories.${person.category}`
        : "";
      const categoryLabel = categoryKey
        ? translate(categoryKey, person?.category ?? "")
        : "";

      const genderKey = person?.gender
        ? `people.genders.${person.gender}`
        : "";
      const genderLabel = genderKey
        ? translate(genderKey, person?.gender ?? "")
        : "";

      const shirtKey = person?.shirtSize
        ? `people.shirtSizes.${person.shirtSize}`
        : "";
      const shirtLabel = shirtKey
        ? translate(shirtKey, person?.shirtSize ?? "")
        : "";

      const isTrophyLabel =
        person?.isTrophy !== undefined && person?.isTrophy !== null
          ? translate(person.isTrophy ? "yes" : "no")
          : "";

      const statusLabel = translate("trophy.status.registered", "Registered");
      const eventTitle =
        eventTitles.get(row.eventId) || row.event?.title || "";

      const personCreatedAt = person?.get("createdAt") as Date | undefined;
      const rowCreatedAt = row.get("createdAt") as Date | undefined;
      const rowUpdatedAt = row.get("updatedAt") as Date | undefined;

      const dob = resolveDateOfBirth(
        person?.dateOfBirth,
        person?.ageYears,
        personCreatedAt || rowCreatedAt
      );
      const sentAt = resolveInvitationSent(row.sentAt, rowCreatedAt);
      const registeredAt = resolveRegisteredAt(
        row.acceptedAt,
        rowUpdatedAt || rowCreatedAt
      );

      const dataRow: ExcelCell[] = [
        eventTitle,
        statusLabel,
        person?.yfId ?? "",
        personDisplayName(person) || person?.fullName || "",
        person?.email || row.emailSnapshot || "",
        genderLabel,
        shirtLabel,
        formatPhoneDisplay(person?.phone) || person?.phone || "",
        dob,
        person?.region ?? "",
        person?.town ?? "",
        person?.address ?? "",
        categoryLabel,
        person?.points ?? "",
        person?.ageYears ?? "",
        sentAt,
        registeredAt,
        person?.division ?? "",
        person?.subDivision ?? "",
        person?.churchName ?? "",
        person?.churchPastorName ?? "",
        person?.churchAddress ?? "",
        person?.parentGuardianName ?? "",
        formatPhoneDisplay(person?.parentGuardianPhone) ||
          person?.parentGuardianPhone ||
          "",
        person?.medicalNotes ?? "",
        isTrophyLabel,
      ];

      const signature = dataRow
        .map((cell) =>
          cell instanceof Date
            ? cell.toISOString()
            : String(cell ?? "").trim()
        )
        .join("\u0000");

      if (seenSignatures.has(signature)) {
        continue;
      }
      seenSignatures.add(signature);
      dataRows.push(dataRow);
    }

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
