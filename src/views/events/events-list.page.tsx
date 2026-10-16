"use client";

import { EventForm } from "@/components/events/event-form.component";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useEventsListPage } from "@/hooks/events/use-events-list.hook";

export function EventsListPage() {
  const { table, openCreate } = useEventsListPage();

  return (
    <ListView>
      <ListViewHeader
        onCreate={() =>
          openCreate("events", ({ close }) => (
            <EventForm mode="create" onCancel={close} onSuccess={close} />
          ))
        }
      />
      <DataTable table={table} />
    </ListView>
  );
}
