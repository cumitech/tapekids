"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { useWaitingListReportTable } from "@/hooks/reports/use-report-list.hook";

export function WaitingListReportTable() {
  const { table } = useWaitingListReportTable();
  return <DataTable table={table} />;
}
