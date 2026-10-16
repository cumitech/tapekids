"use client";

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
import { useEventsShowPage } from "@/hooks/events/use-events-show.hook";
import { cn } from "@/lib/utils";

export function EventsShowPage() {
  const page = useEventsShowPage();
  const { record, labels } = page;

  return (
    <ShowView>
      <ShowViewHeader
        title={record?.title ?? labels.titles.show}
        onEdit={
          record
            ? () =>
                page.openEdit("events", record.id, ({ close }) => (
                  <EventForm
                    mode="edit"
                    id={record.id}
                    onCancel={close}
                    onSuccess={() => {
                      close();
                      page.refetch();
                    }}
                  />
                ))
            : undefined
        }
      />
      {record && page.detailFields ? (
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
                fields={page.detailFields}
              />
            </div>
          </article>
          <EventOperations eventId={record.id} />
        </div>
      ) : null}
    </ShowView>
  );
}
