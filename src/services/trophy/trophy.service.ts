import type { AppLocale } from "@/constants/locales";
import { REPORT_KINDS } from "@/constants/reports";
import { TrophyRepository } from "@/data/repositories/trophy.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { reportFileName } from "@/lib/export/workbook";
import type { SponsorReportRow } from "@/models/reports/sponsor-report.model";
import type { TrophyEntry, TrophyStats } from "@/models/trophy/trophy.model";
import { reportService } from "@/services/reports/report.service";

const trophyRepository = new TrophyRepository();

export class TrophyService {
  async list(query: ListQuery): Promise<PaginatedResult<TrophyEntry>> {
    const result = await reportService.listTrophyParticipants(query);
    return {
      ...result,
      data: result.data.map(toTrophyEntry),
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
    const exported = await reportService.exportWorkbook(
      REPORT_KINDS.TROPHY_PARTICIPANTS,
      locale
    );
    return {
      filename: reportFileName("trophy"),
      buffer: exported.buffer,
    };
  }
}

function toTrophyEntry(row: SponsorReportRow): TrophyEntry {
  return {
    id: row.id,
    personId: row.personId,
    eventId: row.eventId,
    fullName: row.fullName,
    yfId: row.yfId ?? null,
    email: row.email ?? "",
    phone: row.phone ?? null,
    category: row.category ?? null,
    eventTitle: row.eventTitle,
    sentAt: toIso(row.sentAt),
    acceptedAt: toIso(row.registeredAt),
    status: row.status,
  };
}

function toIso(value?: string | Date | null) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const trophyService = new TrophyService();
