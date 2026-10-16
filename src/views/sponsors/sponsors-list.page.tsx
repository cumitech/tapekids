"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useSponsorsListPage } from "@/hooks/sponsors/use-sponsors-list.hook";

export function SponsorsListPage() {
  const { table } = useSponsorsListPage();

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <DataTable table={table} />
    </ListView>
  );
}
