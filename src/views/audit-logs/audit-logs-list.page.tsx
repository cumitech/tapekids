"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useAuditLogsListPage } from "@/hooks/audit-logs/use-audit-logs-list.hook";

export function AuditLogsListPage() {
  const { table } = useAuditLogsListPage();

  return (
    <ListView>
      <ListViewHeader />
      <DataTable table={table} />
    </ListView>
  );
}
