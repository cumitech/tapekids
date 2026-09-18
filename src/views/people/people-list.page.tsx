"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PersonForm } from "@/components/people/person-form.component";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatPhoneDisplay } from "@/lib/phone";
import type { Person } from "@/models/people/person.model";

export function PeopleListPage() {
  const { openCreate, openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("people", [
    "firstName",
    "lastName",
    "email",
    "phone",
    "region",
    "division",
    "subDivision",
    "town",
    "churchName",
  ]);

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "lastName",
        accessorKey: "lastName",
        header: labels.fields.lastName,
      },
      {
        id: "firstName",
        accessorKey: "firstName",
        header: labels.fields.firstName,
      },
      { id: "email", accessorKey: "email", header: labels.fields.email },
      {
        id: "phone",
        accessorKey: "phone",
        header: labels.fields.phone,
        cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "-",
      },
      {
        id: "region",
        accessorKey: "region",
        header: labels.fields.region,
        ...columnFilter(),
      },
      {
        id: "division",
        accessorKey: "division",
        header: labels.fields.division,
        ...columnFilter(),
      },
      {
        id: "subDivision",
        accessorKey: "subDivision",
        header: labels.fields.subDivision,
        ...columnFilter(),
      },
      {
        id: "town",
        accessorKey: "town",
        header: labels.fields.town,
        ...columnFilter(),
      },
      {
        id: "churchName",
        accessorKey: "churchName",
        header: labels.fields.churchName,
        ...columnFilter(),
      },
      {
        id: "actions",
        header: labels.tableActions,
        cell: ({ row }) => (
          <ResourceRowActions
            id={row.original.id}
            onEdit={() =>
              openEdit("people", row.original.id, ({ close }) => (
                <PersonForm
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

  const { table } = useCachedTable<Person>({
    resource: "people",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader
        onCreate={() =>
          openCreate("people", ({ close }) => (
            <PersonForm mode="create" onCancel={close} onSuccess={close} />
          ))
        }
      />
      <DataTable table={table} />
    </ListView>
  );
}
