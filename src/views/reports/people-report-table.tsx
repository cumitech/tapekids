"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import type { PersonReportKind } from "@/constants/reports";
import { usePeopleReportTable } from "@/hooks/reports/use-report-list.hook";

export function PeopleReportTable({ kind }: { kind: PersonReportKind }) {
  const { table } = usePeopleReportTable(kind);
  return <DataTable table={table} />;
}
