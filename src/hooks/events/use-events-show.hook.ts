"use client";

import { useShow } from "@refinedev/core";

import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Event } from "@/models/events/event.model";

export const EVENT_SHOW_FIELDS = [
  "city",
  "venue",
  "startsAt",
  "endsAt",
  "isPublished",
  "currency",
  "requiresParticipantFee",
  "participantFeeAmount",
] as const;

function moneyOrDash(
  amount: string | number | null | undefined,
  currency: string
) {
  if (amount == null || amount === "") {
    return "-";
  }
  return formatMoney(amount, currency);
}

export function useEventsShowPage() {
  const { openEdit } = useDashboardFormModal();
  const { locale } = useLocale();
  const labels = useResourceLabels("events", EVENT_SHOW_FIELDS);
  const { query } = useShow<Event>({ resource: "events" });
  const record = query.data?.data;
  const currency = record?.currency || "XAF";

  const detailFields = record
    ? {
        city: record.city,
        venue: record.venue,
        startsAt: formatDateTime(record.startsAt, locale),
        endsAt: formatDateTime(record.endsAt, locale) || "-",
        isPublished: record.isPublished,
        currency,
        requiresParticipantFee: record.requiresParticipantFee,
        participantFeeAmount: moneyOrDash(
          record.participantFeeAmount,
          currency
        ),
      }
    : null;

  return {
    labels,
    record,
    detailFields,
    openEdit,
    refetch: () => void query.refetch(),
  };
}
