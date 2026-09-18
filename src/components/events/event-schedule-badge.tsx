"use client";

import { useTranslate } from "@refinedev/core";

import { Badge } from "@/components/shared/ui/badge";
import {
  EVENT_SCHEDULE_STATUSES,
  type EventScheduleStatus,
} from "@/constants/event-schedule";
import { eventScheduleStatus } from "@/lib/events/event-schedule";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<EventScheduleStatus, string> = {
  [EVENT_SCHEDULE_STATUSES.UPCOMING]:
    "border-transparent bg-primary text-primary-foreground",
  [EVENT_SCHEDULE_STATUSES.ACTIVE]:
    "border-transparent bg-success text-success-foreground",
  [EVENT_SCHEDULE_STATUSES.PAST]:
    "border-border bg-muted text-muted-foreground",
};

export function EventScheduleBadge({
  startsAt,
  endsAt,
  status,
}: {
  startsAt?: string | Date;
  endsAt?: string | Date | null;
  status?: EventScheduleStatus;
}) {
  const translate = useTranslate();
  const value =
    status ??
    (startsAt
      ? eventScheduleStatus(startsAt, endsAt)
      : EVENT_SCHEDULE_STATUSES.UPCOMING);

  return (
    <Badge variant="outline" className={cn("rounded-full", STATUS_CLASS[value])}>
      {translate(`events.schedule.${value}`)}
    </Badge>
  );
}
