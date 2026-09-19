"use client";

import { useEffect, useRef, useState } from "react";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { TABLE_DEFAULTS } from "@/constants/table-defaults";

type DataTableSearchProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
};

export function DataTableSearch<TData extends BaseRecord>({
  table,
}: DataTableSearchProps<TData>) {
  const translate = useTranslate();
  const tableRef = useRef(table);
  tableRef.current = table;
  const column = table.reactTable.getColumn("q");
  const applied = String(column?.getFilterValue() ?? "");
  const [value, setValue] = useState(applied);

  useEffect(() => {
    setValue(applied);
  }, [applied]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextColumn = tableRef.current.reactTable.getColumn("q");
      if (!nextColumn) {
        return;
      }
      const next = value.trim();
      const current = String(nextColumn.getFilterValue() ?? "").trim();
      if (next === current) {
        return;
      }
      nextColumn.setFilterValue(next || undefined);
    }, TABLE_DEFAULTS.searchDebounceMs);

    return () => window.clearTimeout(handle);
  }, [value]);

  if (!column) {
    return null;
  }

  return (
    <div className="relative w-full min-w-0 md:max-w-sm">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground md:left-2.5 md:size-4" />
      <Input
        value={value}
        placeholder={translate("table.filter.searchPlaceholder")}
        className="h-12 rounded-xl border-border bg-white pl-11 pr-12 shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:h-9 md:rounded-md md:pl-8 md:pr-8"
        onChange={(event) => setValue(event.target.value)}
      />
      {value ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 size-10 -translate-y-1/2 text-muted-foreground md:right-0.5 md:size-7"
          onClick={() => setValue("")}
        >
          <X className="size-5 md:size-3.5" />
          <span className="sr-only">{translate("buttons.clear")}</span>
        </Button>
      ) : null}
    </div>
  );
}
