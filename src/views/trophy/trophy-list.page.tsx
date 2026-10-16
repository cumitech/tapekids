"use client";

import { Download, Loader2 } from "lucide-react";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { useTrophyListPage } from "@/hooks/trophy/use-trophy-list.hook";

export function TrophyListPage() {
  const page = useTrophyListPage();

  return (
    <ListView>
      <ListViewHeader
        resource="trophy"
        canCreate={false}
        stats={page.heroStats}
      >
        <Button
          type="button"
          variant="outline"
          disabled={page.downloading}
          onClick={() => void page.handleExport()}
        >
          {page.downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {page.downloading
            ? page.translate("trophy.exporting")
            : page.translate("trophy.export")}
        </Button>
      </ListViewHeader>
      <DataTable table={page.table} />
    </ListView>
  );
}
