import { EVENT_TYPES, type EventType } from "@/constants/event-type";

const DAY_MS = 24 * 60 * 60 * 1000;

function asDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Camps last more than one calendar day and are for trophy campers.
 * Day events start and end on the same day and are for trophy participants.
 */
export function eventSpanError(
  eventType: string | null | undefined,
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined
) {
  const start = asDate(startsAt);
  if (!start) {
    return null;
  }
  const end = asDate(endsAt);
  const type: EventType =
    eventType === EVENT_TYPES.DAY_EVENT ? EVENT_TYPES.DAY_EVENT : EVENT_TYPES.CAMP;

  if (type === EVENT_TYPES.DAY_EVENT) {
    if (!end || calendarDay(start) !== calendarDay(end)) {
      return "A day event for participants must start and end on the same day.";
    }
    if (end.getTime() <= start.getTime()) {
      return "The end must be after the start.";
    }
    return null;
  }

  if (!end || calendarDay(end) - calendarDay(start) < DAY_MS) {
    return "A camp for campers must end on a later day than it starts.";
  }
  if (end.getTime() <= start.getTime()) {
    return "The end must be after the start.";
  }
  return null;
}
