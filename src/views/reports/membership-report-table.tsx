"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { useMembershipReportTable } from "@/hooks/reports/use-report-list.hook";

export function MembershipReportTable({ resource }: { resource: string }) {
  const { table } = useMembershipReportTable(resource);
  return <DataTable table={table} />;
}
