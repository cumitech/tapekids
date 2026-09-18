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
    <div className="relative w-full min-w-0 max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        placeholder={translate("table.filter.searchPlaceholder")}
        className="pl-8 pr-8"
        onChange={(event) => setValue(event.target.value)}
      />
      {value ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
          onClick={() => setValue("")}
        >
          <X className="size-3.5" />
          <span className="sr-only">{translate("buttons.clear")}</span>
        </Button>
      ) : null}
    </div>
  );
}
