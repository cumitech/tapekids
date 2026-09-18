import {
  EVENT_SCHEDULE_STATUSES,
  type EventScheduleStatus,
} from "@/constants/event-schedule";

const DAY_MS = 24 * 60 * 60 * 1000;

export function eventScheduleStatus(
  startsAt: string | Date,
  endsAt?: string | Date | null,
  now: Date = new Date()
): EventScheduleStatus {
  const start = new Date(startsAt).getTime();
  if (!Number.isFinite(start)) {
    return EVENT_SCHEDULE_STATUSES.UPCOMING;
  }

  const endSource = endsAt ? new Date(endsAt).getTime() : start + DAY_MS;
  const end = Number.isFinite(endSource) ? endSource : start + DAY_MS;
  const t = now.getTime();

  if (t < start) {
    return EVENT_SCHEDULE_STATUSES.UPCOMING;
  }
  if (t > end) {
    return EVENT_SCHEDULE_STATUSES.PAST;
  }
  return EVENT_SCHEDULE_STATUSES.ACTIVE;
}
