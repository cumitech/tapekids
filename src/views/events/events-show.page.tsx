"use client";

import { useShow } from "@refinedev/core";

import { EventForm } from "@/components/events/event-form.component";
import { EventImage } from "@/components/events/event-image";
import { EventOperations } from "@/components/events/event-operations";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";
import { RecordDetails } from "@/components/shared/record-details";
import { RichText } from "@/components/shared/rich-text";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event } from "@/models/events/event.model";

function moneyOrDash(
  amount: string | number | null | undefined,
  currency: string
) {
  if (amount == null || amount === "") {
    return "-";
  }
  return formatMoney(amount, currency);
}

const EVENT_FIELDS = [
  "city",
  "venue",
  "startsAt",
  "endsAt",
  "isPublished",
  "currency",
  "requiresParticipantFee",
  "participantFeeAmount",
  "coordinatorFundAmount",
  "sponsorFundAmount",
] as const;

export function EventsShowPage() {
  const { openEdit } = useDashboardFormModal();
  const { locale } = useLocale();
  const labels = useResourceLabels("events", EVENT_FIELDS);
  const { query } = useShow<Event>({ resource: "events" });
  const record = query.data?.data;
  const currency = record?.currency || "XAF";

  return (
    <ShowView>
      <ShowViewHeader
        title={record?.title ?? labels.titles.show}
        onEdit={
          record
            ? () =>
                openEdit("events", record.id, ({ close }) => (
                  <EventForm
                    mode="edit"
                    id={record.id}
                    onCancel={close}
                    onSuccess={() => {
                      close();
                      void query.refetch();
                    }}
                  />
                ))
            : undefined
        }
      />
      {record ? (
        <div className="flex flex-col gap-6">
          <article
            className={cn(
              PORTAL_SURFACE,
              "overflow-hidden bg-white dark:bg-card"
            )}
          >
            <EventImage
              src={record.imageUrl}
              alt={record.title}
              className="w-full max-h-96 rounded-none"
            />
            <div className="flex flex-col gap-5 p-5 md:p-6">
              <EventScheduleBadge
                startsAt={record.startsAt}
                endsAt={record.endsAt}
              />
              {record.summary ? (
                <p className="font-serif text-lg leading-relaxed text-foreground">
                  {record.summary}
                </p>
              ) : null}
              {record.description ? (
                <RichText
                  html={record.description}
                  className="text-foreground [&_p]:text-foreground"
                />
              ) : null}
              <RecordDetails
                className="border-0 bg-white p-0 shadow-none"
                labels={labels.fields}
                fields={{
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
                  coordinatorFundAmount: moneyOrDash(
                    record.coordinatorFundAmount,
                    currency
                  ),
                  sponsorFundAmount: moneyOrDash(
                    record.sponsorFundAmount,
                    currency
                  ),
                }}
              />
            </div>
          </article>
          <EventOperations eventId={record.id} />
        </div>
      ) : null}
    </ShowView>
  );
}
