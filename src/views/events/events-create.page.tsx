"use client";

import { EventForm } from "@/components/events/event-form.component";
import {
  CreateView,
  CreateViewHeader,
} from "@/components/shared/refine-ui/views/create-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function EventsCreatePage() {
  const labels = useResourceLabels("events");
  return (
    <CreateView>
      <CreateViewHeader title={labels.titles.create} />
      <EventForm mode="create" />
    </CreateView>
  );
}
