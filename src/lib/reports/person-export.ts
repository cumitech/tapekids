import type { AppLocale } from "@/constants/locales";
import { formatPhoneDisplay } from "@/lib/phone";
import { personDisplayName } from "@/lib/people/display-name";
import type { ExcelCell, ExcelSheetColumn } from "@/lib/export/workbook";
import { dateOnlyInput } from "@/models/people/person.model";
import { i18n } from "@/lib/i18n/instance";

export type PersonExportSource = {
  yfId?: string | null;
  fullName?: string | null;
  email?: string | null;
  gender?: string | null;
  shirtSize?: string | null;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  region?: string | null;
  town?: string | null;
  address?: string | null;
  category?: string | null;
  points?: number | null;
  ageYears?: number | null;
  sentAt?: string | Date | null;
  registeredAt?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

function t(locale: AppLocale) {
  return i18n.getFixedT(locale);
}

export function excelDate(value?: string | Date | null): Date | "" {
  const iso = dateOnlyInput(value);
  if (!iso) {
    return "";
  }
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date;
}

export function resolveDateOfBirth(
  value?: string | Date | null,
  ageYears?: number | null,
  fallbackDate?: string | Date | null
): Date {
  const parsed = excelDate(value);
  if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  if (typeof ageYears === "number" && !Number.isNaN(ageYears) && ageYears > 0) {
    const currentYear = new Date().getFullYear();
    const birthYear = Math.max(1920, currentYear - Math.round(ageYears));
    return new Date(`${birthYear}-01-01T00:00:00`);
  }
  if (fallbackDate) {
    const date = new Date(fallbackDate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  const defaultYear = new Date().getFullYear() - 12;
  return new Date(`${defaultYear}-01-01T00:00:00`);
}

export function resolveInvitationSent(
  value?: string | Date | null,
  fallbackDate?: string | Date | null
): Date {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  if (fallbackDate) {
    const date = new Date(fallbackDate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
}

export function resolveRegisteredAt(
  value?: string | Date | null,
  fallbackDate?: string | Date | null
): Date {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  if (fallbackDate) {
    const date = new Date(fallbackDate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
}

export function personExportColumns(locale: AppLocale): ExcelSheetColumn[] {
  const translate = t(locale);
  return [
    { header: translate("people.fields.yfId"), width: 16 },
    { header: translate("people.fields.fullName"), width: 28 },
    { header: translate("people.fields.email"), width: 28 },
    { header: translate("people.fields.gender"), width: 12 },
    { header: translate("people.fields.shirtSize"), width: 28 },
    { header: translate("people.fields.phone"), width: 18 },
    { header: translate("people.fields.dateOfBirth"), width: 14 },
    { header: translate("people.fields.region"), width: 18 },
    { header: translate("people.fields.town"), width: 16 },
    { header: translate("people.fields.address"), width: 32 },
    { header: translate("people.fields.category"), width: 22 },
    { header: translate("people.fields.points"), width: 10 },
    { header: translate("people.fields.ageYears"), width: 8 },
    {
      header: translate("trophy.fields.sentAt", "Invitation sent"),
      width: 20,
    },
    {
      header: translate("trophy.fields.registeredAt", "Registered at"),
      width: 20,
    },
  ];
}

export function personExportRow(
  person: PersonExportSource,
  locale: AppLocale
): ExcelCell[] {
  const translate = t(locale);
  const dob = resolveDateOfBirth(
    person.dateOfBirth,
    person.ageYears,
    person.createdAt
  );
  const sentAt = resolveInvitationSent(person.sentAt, person.createdAt);
  const registeredAt = resolveRegisteredAt(
    person.registeredAt,
    person.updatedAt ?? person.createdAt
  );

  return [
    person.yfId ?? "",
    personDisplayName(person),
    person.email ?? "",
    person.gender ? translate(`people.genders.${person.gender}`) : "",
    person.shirtSize ? translate(`people.shirtSizes.${person.shirtSize}`) : "",
    formatPhoneDisplay(person.phone),
    dob,
    person.region ?? "",
    person.town ?? "",
    person.address ?? "",
    person.category ? translate(`people.categories.${person.category}`) : "",
    person.points ?? "",
    person.ageYears ?? "",
    sentAt,
    registeredAt,
  ];
}

export function sponsorExportColumns(locale: AppLocale): ExcelSheetColumn[] {
  const translate = t(locale);
  return [
    { header: translate("events.fields.title"), width: 32 },
    { header: translate("payments.fields.status"), width: 14 },
    ...personExportColumns(locale),
  ];
}

export function sponsorExportRow(
  row: PersonExportSource & { eventTitle: string; status: string },
  locale: AppLocale
): ExcelCell[] {
  const translate = t(locale);
  return [
    row.eventTitle,
    translate(`portal.status.membership.${row.status}`, row.status),
    ...personExportRow(row, locale),
  ];
}
