"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { EventForm } from "@/components/events/event-form.component";
import { EventImage } from "@/components/events/event-image";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { Event } from "@/models/events/event.model";

export function EventsListPage() {
  const { openCreate, openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("events", [
    "title",
    "imageUrl",
    "city",
    "venue",
    "startsAt",
    "scheduleStatus",
  ]);

  const columns = useMemo<ColumnDef<Event>[]>(
    () => [
      {
        id: "imageUrl",
        header: labels.fields.imageUrl,
        cell: ({ row }) => (
          <EventImage
            src={row.original.imageUrl}
            alt={row.original.title}
            className="size-14 shrink-0 rounded-md aspect-square"
          />
        ),
      },
      { id: "title", accessorKey: "title", header: labels.fields.title },
      {
        id: "city",
        accessorKey: "city",
        header: labels.fields.city,
        ...columnFilter(),
      },
      {
        id: "venue",
        accessorKey: "venue",
        header: labels.fields.venue,
        ...columnFilter(),
      },
      { id: "startsAt", accessorKey: "startsAt", header: labels.fields.startsAt },
      {
        id: "scheduleStatus",
        header: labels.fields.scheduleStatus,
        cell: ({ row }) => (
          <EventScheduleBadge
            startsAt={row.original.startsAt}
            endsAt={row.original.endsAt}
          />
        ),
      },
      {
        id: "actions",
        header: labels.tableActions,
        cell: ({ row }) => (
          <ResourceRowActions
            id={row.original.id}
            onEdit={() =>
              openEdit("events", row.original.id, ({ close }) => (
                <EventForm
                  mode="edit"
                  id={row.original.id}
                  onCancel={close}
                  onSuccess={close}
                />
              ))
            }
          />
        ),
      },
    ],
    [labels, openEdit]
  );

  const { table } = useCachedTable<Event>({
    resource: "events",
    columns,
  });

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
