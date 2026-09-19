"use client";

import { useTranslate } from "@refinedev/core";

import { Badge } from "@/components/shared/ui/badge";
import {
  INVITATION_BATCH_STATUSES,
  INVITATION_STATUSES,
  MEMBERSHIP_STATUSES,
  PAYMENT_STATUSES,
} from "@/constants/event-participation";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  [MEMBERSHIP_STATUSES.REGISTERED]:
    "border-transparent bg-primary text-primary-foreground",
  [MEMBERSHIP_STATUSES.INVITED]:
    "border-transparent bg-warning/20 text-foreground",
  [MEMBERSHIP_STATUSES.CANCELLED]:
    "border-transparent bg-destructive text-white",
  [PAYMENT_STATUSES.PAID]:
    "border-transparent bg-success text-success-foreground",
  [PAYMENT_STATUSES.PENDING]:
    "border-transparent bg-warning text-warning-foreground",
  [PAYMENT_STATUSES.WAIVED]:
    "border-border bg-muted text-muted-foreground",
  [PAYMENT_STATUSES.FAILED]:
    "border-transparent bg-destructive text-white",
  [INVITATION_BATCH_STATUSES.DRAFT]:
    "border-border bg-muted text-muted-foreground",
  [INVITATION_BATCH_STATUSES.SENDING]:
    "border-transparent bg-warning/20 text-foreground",
  [INVITATION_BATCH_STATUSES.SENT]:
    "border-transparent bg-success text-success-foreground",
  [INVITATION_STATUSES.QUEUED]:
    "border-border bg-muted text-muted-foreground",
  [INVITATION_STATUSES.ACCEPTED]:
    "border-transparent bg-primary text-primary-foreground",
};

export function StatusBadge({
  value,
  namespace,
}: {
  value: string;
  namespace: "membership" | "payment" | "batch";
}) {
  const translate = useTranslate();
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full", STATUS_CLASS[value])}
    >
      {translate(`portal.status.${namespace}.${value}`, value)}
    </Badge>
  );
}
