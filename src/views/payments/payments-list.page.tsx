"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";

import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { Payment } from "@/models/payments/payment.model";

function personLabel(payment: Payment) {
  const person = payment.person;
  if (!person) {
    return payment.personId;
  }
  return person.fullName || person.email || payment.personId;
}

export function PaymentsListPage() {
  const translate = useTranslate();
  const labels = useResourceLabels("payments", [
    "trackingId",
    "person",
    "event",
    "kind",
    "amount",
    "status",
    "createdAt",
  ]);

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        id: "trackingId",
        accessorKey: "trackingId",
        header: labels.fields.trackingId,
        cell: ({ row }) => (
          <span className="font-mono">{row.original.trackingId || "-"}</span>
        ),
      },
      {
        id: "person",
        header: labels.fields.person,
        accessorFn: (row) => personLabel(row),
        cell: ({ row }) => personLabel(row.original),
      },
      {
        id: "event",
        header: labels.fields.event,
        accessorFn: (row) => row.event?.title ?? row.eventId,
        cell: ({ row }) => row.original.event?.title ?? row.original.eventId,
      },
      {
        id: "kind",
        accessorKey: "kind",
        header: labels.fields.kind,
        cell: ({ row }) =>
          translate(`payments.kinds.${row.original.kind}`, row.original.kind),
        ...columnFilter(),
      },
      {
        id: "amount",
        header: labels.fields.amount,
        accessorFn: (row) => `${row.amount} ${row.currency}`,
        cell: ({ row }) =>
          `${row.original.amount} ${row.original.currency}`,
      },
      {
        id: "status",
        accessorKey: "status",
        header: labels.fields.status,
        ...columnFilter(),
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: labels.fields.createdAt,
        cell: ({ row }) => {
          const value = row.original.createdAt;
          if (!value) {
            return "-";
          }
          return new Date(value).toLocaleString();
        },
      },
    ],
    [labels, translate]
  );

  const { table } = useCachedTable<Payment>({
    resource: "payments",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <DataTable table={table} />
    </ListView>
  );
}
