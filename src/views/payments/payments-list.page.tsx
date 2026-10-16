"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { usePaymentsListPage } from "@/hooks/payments/use-payments-list.hook";

export function PaymentsListPage() {
  const { table } = usePaymentsListPage();

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <DataTable table={table} />
    </ListView>
  );
}
