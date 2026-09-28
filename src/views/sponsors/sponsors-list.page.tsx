"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

type SponsorRow = {
  id: string;
  anonymous: boolean;
  paymentPhone: string;
  createdAt?: string | null;
  person?: { fullName?: string; email?: string | null };
  event?: { title?: string };
  payment?: { status?: string; amount?: string; currency?: string; trackingId?: string };
};

export function SponsorsListPage() {
  const translate = useTranslate();
  const labels = useResourceLabels("sponsors", [
    "person",
    "email",
    "anonymous",
    "event",
    "amount",
    "status",
    "paymentPhone",
    "trackingId",
  ]);

  const columns = useMemo<ColumnDef<SponsorRow>[]>(
    () => [
      {
        id: "person",
        header: labels.fields.person,
        accessorFn: (row) => row.person?.fullName ?? "",
      },
      {
        id: "email",
        header: labels.fields.email,
        accessorFn: (row) => row.person?.email ?? "",
      },
      {
        id: "anonymous",
        header: labels.fields.anonymous,
        accessorFn: (row) => row.anonymous,
        cell: ({ row }) =>
          row.original.anonymous
            ? translate("sponsors.anonymousYes")
            : translate("sponsors.anonymousNo"),
      },
      {
        id: "event",
        header: labels.fields.event,
        accessorFn: (row) => row.event?.title ?? "",
      },
      {
        id: "amount",
        header: labels.fields.amount,
        cell: ({ row }) =>
          row.original.payment
            ? `${row.original.payment.amount ?? ""} ${row.original.payment.currency ?? ""}`.trim()
            : "-",
      },
      {
        id: "status",
        header: labels.fields.status,
        cell: ({ row }) => row.original.payment?.status ?? "-",
      },
      {
        id: "paymentPhone",
        header: labels.fields.paymentPhone,
        accessorKey: "paymentPhone",
      },
      {
        id: "trackingId",
        header: labels.fields.trackingId,
        cell: ({ row }) => (
          <span className="font-mono">{row.original.payment?.trackingId || "-"}</span>
        ),
      },
    ],
    [labels, translate]
  );

  const { table } = useCachedTable<SponsorRow>({
    resource: "sponsors",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <DataTable table={table} />
    </ListView>
  );
}
