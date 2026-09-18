export const EVENT_SCHEDULE_STATUSES = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  PAST: "past",
} as const;

export type EventScheduleStatus =
  (typeof EVENT_SCHEDULE_STATUSES)[keyof typeof EVENT_SCHEDULE_STATUSES];
