import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { EVENT_MEMBERSHIP_KINDS } from "@/constants/event-participation";
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

  listWaiting(query: ListQuery) {
    return waitingListRepository.listPending(query);
  }

  async exportWorkbook(kind: string, locale = getRequestLocale()) {
    const report = parseKind(kind);
    const translate = i18n.getFixedT(locale);
    const sheetName = translate(`reports.kinds.${report}.title`);
    const filename = reportFileName(report);

    if (
      report === REPORT_KINDS.SPONSORS ||
      report === REPORT_KINDS.PARTICIPANTS
    ) {
      const result = await (report === REPORT_KINDS.SPONSORS
        ? this.listSponsors({ ...PERSON_SEARCH, sort: "fullName" })
        : this.listParticipants({ ...PERSON_SEARCH, sort: "fullName" }));
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
              { header: translate("people.fields.fullName"), width: 28 },
              { header: translate("people.fields.email"), width: 32 },
              { header: translate("people.fields.phone"), width: 18 },
              { header: translate("waitingList.registeredAt"), width: 18 },
            ],
            rows: result.data.map((row) => [
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

  private async listMemberships(
    kind: (typeof EVENT_MEMBERSHIP_KINDS)[keyof typeof EVENT_MEMBERSHIP_KINDS],
    query: ListQuery
  ) {
    const result = await eventMembershipRepository.listByKind(kind, query);
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

export const reportService = new ReportService();
