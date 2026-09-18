"use client";

import { EventForm } from "@/components/events/event-form.component";
import {
  EditView,
  EditViewHeader,
} from "@/components/shared/refine-ui/views/edit-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function EventsEditPage() {
  const labels = useResourceLabels("events");
  return (
    <EditView>
      <EditViewHeader title={labels.titles.edit} />
      <EventForm mode="edit" />
    </EditView>
  );
}
