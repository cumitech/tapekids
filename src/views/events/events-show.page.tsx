"use client";

import { useShow } from "@refinedev/core";

import { EventForm } from "@/components/events/event-form.component";
import { EventImage } from "@/components/events/event-image";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";
import { RecordDetails } from "@/components/shared/record-details";
import { RichText } from "@/components/shared/rich-text";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { Event } from "@/models/events/event.model";

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
  const labels = useResourceLabels("events", EVENT_FIELDS);
  const { query } = useShow<Event>({ resource: "events" });
  const record = query.data?.data;

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
          <div className="flex flex-wrap items-center gap-2">
            <EventScheduleBadge
              startsAt={record.startsAt}
              endsAt={record.endsAt}
            />
          </div>
          <div className="overflow-hidden rounded-2xl bg-muted">
            <EventImage
              src={record.imageUrl}
              alt={record.title}
              className="w-full max-h-96"
            />
          </div>
          {record.summary ? (
            <p className="max-w-2xl font-serif text-base leading-relaxed text-muted-foreground">
              {record.summary}
            </p>
          ) : null}
          {record.description ? <RichText html={record.description} /> : null}
          <RecordDetails
            labels={labels.fields}
            fields={{
              city: record.city,
              venue: record.venue,
              startsAt: record.startsAt,
              endsAt: record.endsAt,
              isPublished: record.isPublished,
              currency: record.currency,
              requiresParticipantFee: record.requiresParticipantFee,
              participantFeeAmount: record.participantFeeAmount,
              coordinatorFundAmount: record.coordinatorFundAmount,
              sponsorFundAmount: record.sponsorFundAmount,
            }}
          />
        </div>
      ) : null}
    </ShowView>
  );
}
