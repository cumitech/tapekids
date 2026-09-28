import {
  PERSON_CATEGORIES,
  type PersonCategory,
} from "@/constants/person";

export const REPORT_KINDS = {
  TROPHY_CAMPERS: "trophy-campers",
  TROPHY_PARTICIPANTS: "trophy-participants",
  CHAPERONES: "chaperones",
  SPONSORS: "sponsors",
  PARTICIPANTS: "participants",
  WAITING_LIST: "waiting-list",
} as const;

export type ReportKind = (typeof REPORT_KINDS)[keyof typeof REPORT_KINDS];

export const REPORT_KIND_VALUES: ReportKind[] = Object.values(REPORT_KINDS);

export const PERSON_REPORT_KINDS = [
  REPORT_KINDS.TROPHY_CAMPERS,
  REPORT_KINDS.TROPHY_PARTICIPANTS,
  REPORT_KINDS.CHAPERONES,
] as const;

export type PersonReportKind = (typeof PERSON_REPORT_KINDS)[number];

export const REPORT_PERSON_CATEGORY: Record<PersonReportKind, PersonCategory> = {
  [REPORT_KINDS.TROPHY_CAMPERS]: PERSON_CATEGORIES.TROPHY_CAMPER,
  [REPORT_KINDS.TROPHY_PARTICIPANTS]: PERSON_CATEGORIES.TROPHY_PARTICIPANT,
  [REPORT_KINDS.CHAPERONES]: PERSON_CATEGORIES.CHAPERONE,
};

export const REPORT_EXPORT_LIMIT = 10_000;

export function isReportKind(value: unknown): value is ReportKind {
  return REPORT_KIND_VALUES.includes(value as ReportKind);
}

export function isPersonReportKind(value: unknown): value is PersonReportKind {
  return PERSON_REPORT_KINDS.includes(value as PersonReportKind);
}

export function reportPersonCategory(kind: PersonReportKind): PersonCategory {
  return REPORT_PERSON_CATEGORY[kind];
}
