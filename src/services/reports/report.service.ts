import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import {
  EVENT_MEMBERSHIP_KINDS,
  MEMBERSHIP_STATUSES,
  type MembershipStatus,
} from "@/constants/event-participation";
import type { PersonCategory } from "@/constants/person";
import type { AppLocale } from "@/constants/locales";
import {
  isPersonReportKind,
  isReportKind,
  REPORT_EXPORT_LIMIT,
  REPORT_KINDS,
  reportPersonCategory,
  type ReportKind,
} from "@/constants/reports";
import type { EventMembership } from "@/data/entities/event-membership";
import type { Person } from "@/data/entities/person";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import { WaitingListRepository } from "@/data/repositories/waiting-list.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ValidationException } from "@/exceptions/validation.exception";
import { getRequestLocale } from "@/lib/api/request-locale";
import { reportFileName, workbookBuffer } from "@/lib/export/workbook";
import {
  personExportColumns,
  personExportRow,
  sponsorExportColumns,
  sponsorExportRow,
} from "@/lib/reports/person-export";
import type { SponsorReportRow } from "@/models/reports/sponsor-report.model";
import { i18n } from "@/lib/i18n/instance";

const personRepository = new PersonRepository();
const eventMembershipRepository = new EventMembershipRepository();
const waitingListRepository = new WaitingListRepository();

const PERSON_SEARCH: ListQuery = {
  offset: 0,
  limit: REPORT_EXPORT_LIMIT,
  sort: "fullName",
  order: "ASC",
};

function parseKind(value: string): ReportKind {
  if (!isReportKind(value)) {
    throw new ValidationException("Unknown report.");
  }
  return value;
}

function toSponsorRow(
  membership: EventMembership,
  eventTitle: string
): SponsorReportRow {
  const person = membership.person;
  return {
    id: membership.id,
    personId: membership.personId,
    eventId: membership.eventId,
    eventTitle,
    status: membership.status,
    yfId: person?.yfId ?? null,
    fullName: person?.fullName ?? "",
    email: person?.email ?? null,
    gender: person?.gender ?? null,
    shirtSize: person?.shirtSize ?? null,
    phone: person?.phone ?? null,
    dateOfBirth: person?.dateOfBirth ?? null,
    region: person?.region ?? null,
    town: person?.town ?? null,
    address: person?.address ?? null,
    category: person?.category ?? null,
    points: person?.points ?? null,
    ageYears: person?.ageYears ?? null,
    isTrophy: person?.isTrophy ?? false,
  };
}

export class ReportService {
  listPeople(kind: ReportKind, query: ListQuery) {
    const report = parseKind(kind);
    if (!isPersonReportKind(report)) {
      throw new ValidationException("Unknown report.");
    }
    return personRepository.list({
      ...query,
      eq: {
        ...query.eq,
        category: reportPersonCategory(report),
      },
    });
  }

  async listSponsors(query: ListQuery) {
    return this.listMemberships(EVENT_MEMBERSHIP_KINDS.SPONSOR, query);
  }

  async listParticipants(query: ListQuery) {
    return this.listMemberships(EVENT_MEMBERSHIP_KINDS.CAMPER, query);
  }

  listTrophyCampers(query: ListQuery) {
    return this.listTrophyMemberships(REPORT_KINDS.TROPHY_CAMPERS, query);
  }

  listTrophyParticipants(query: ListQuery) {
    return this.listTrophyMemberships(REPORT_KINDS.TROPHY_PARTICIPANTS, query);
  }

  listWaiting(query: ListQuery) {
    return waitingListRepository.listJoinRegistrations(query);
  }

  async exportWorkbook(kind: string, locale = getRequestLocale()) {
    const report = parseKind(kind);
    const translate = i18n.getFixedT(locale);
    const sheetName = translate(`reports.kinds.${report}.title`);
    const filename = reportFileName(report);

    if (
      report === REPORT_KINDS.SPONSORS ||
      report === REPORT_KINDS.PARTICIPANTS ||
      report === REPORT_KINDS.TROPHY_CAMPERS ||
      report === REPORT_KINDS.TROPHY_PARTICIPANTS
    ) {
      const result = await this.exportMemberships(report);
      return {
        filename,
        buffer: workbookBuffer([
          {
            name: sheetName,
            columns: sponsorExportColumns(locale),
            rows: result.data.map((row) => sponsorExportRow(row, locale)),
          },
        ]),
      };
    }

    if (report === REPORT_KINDS.WAITING_LIST) {
      const result = await this.listWaiting(PERSON_SEARCH);
      return {
        filename,
        buffer: workbookBuffer([
          {
            name: sheetName,
            columns: [
              { header: translate("waitingList.event"), width: 32 },
              { header: translate("payments.fields.status"), width: 14 },
              { header: translate("people.fields.yfId"), width: 16 },
              { header: translate("people.fields.fullName"), width: 28 },
              { header: translate("people.fields.email"), width: 32 },
              { header: translate("people.fields.phone"), width: 18 },
              { header: translate("waitingList.registeredAt"), width: 18 },
            ],
            rows: result.data.map((row) => [
              eventTitleOf(row.details),
              translate(
                `waitingList.status.${row.status}`,
                row.status
              ),
              row.yfId ?? "",
              row.fullName,
              row.email,
              row.phone ?? "",
              row.createdAt ? new Date(row.createdAt) : "",
            ]),
          },
        ]),
      };
    }

    const result = await this.listPeople(report, PERSON_SEARCH);
    return {
      filename,
      buffer: workbookBuffer([
        {
          name: sheetName,
          columns: personExportColumns(locale),
          rows: result.data.map((person) =>
            personExportRow(person as Person, locale)
          ),
        },
      ]),
    };
  }

  private listTrophyMemberships(
    kind: typeof REPORT_KINDS.TROPHY_CAMPERS | typeof REPORT_KINDS.TROPHY_PARTICIPANTS,
    query: ListQuery
  ) {
    return this.listMemberships(EVENT_MEMBERSHIP_KINDS.CAMPER, query, {
      category: reportPersonCategory(kind),
      statuses: [MEMBERSHIP_STATUSES.INVITED, MEMBERSHIP_STATUSES.REGISTERED],
    });
  }

  private exportMemberships(report: ReportKind) {
    const query = { ...PERSON_SEARCH, sort: "fullName" };
    if (report === REPORT_KINDS.SPONSORS) {
      return this.listSponsors(query);
    }
    if (report === REPORT_KINDS.PARTICIPANTS) {
      return this.listParticipants(query);
    }
    if (report === REPORT_KINDS.TROPHY_CAMPERS) {
      return this.listTrophyCampers(query);
    }
    return this.listTrophyParticipants(query);
  }

  private async listMemberships(
    kind: (typeof EVENT_MEMBERSHIP_KINDS)[keyof typeof EVENT_MEMBERSHIP_KINDS],
    query: ListQuery,
    options?: {
      category?: PersonCategory;
      statuses?: MembershipStatus[];
    }
  ) {
    const result = await eventMembershipRepository.listByKind(kind, query, options);
    return {
      ...result,
      data: await this.withEventTitles(result.data),
    };
  }

  private async withEventTitles(
    rows: EventMembership[],
    locale?: AppLocale
  ): Promise<SponsorReportRow[]> {
    const events = [];
    const seen = new Set<string>();
    for (const row of rows) {
      if (row.event && !seen.has(row.event.id)) {
        seen.add(row.event.id);
        events.push(row.event);
      }
    }
    const localized = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.event,
      events,
      locale ?? getRequestLocale()
    );
    const titleById = new Map(
      localized.map((event) => [event.id, event.title ?? ""])
    );

    return rows.map((row) =>
      toSponsorRow(
        row,
        titleById.get(row.eventId) || row.event?.title || ""
      )
    );
  }
}

function eventTitleOf(details: unknown): string {
  const record =
    typeof details === "string"
      ? parsedDetails(details)
      : details && typeof details === "object"
        ? (details as { eventTitle?: unknown })
        : null;
  return typeof record?.eventTitle === "string" ? record.eventTitle : "";
}

function parsedDetails(value: string): { eventTitle?: unknown } | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { eventTitle?: unknown })
      : null;
  } catch {
    return null;
  }
}

export const reportService = new ReportService();
