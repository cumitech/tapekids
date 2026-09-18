"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";
import type { Column } from "@tanstack/react-table";
import { ListFilter, X } from "lucide-react";

import type { SelectOption } from "@/components/shared/form/labeled-select";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import { TABLE_DEFAULTS } from "@/constants/table-defaults";
import { cn } from "@/lib/utils";

export type DataTableColumnFilterMeta = {
  filter?: "text" | "select";
  filterOptions?: SelectOption[];
  filterOperator?: string;
};

export function columnFilter(
  type: "text" | "select" = "text",
  options?: SelectOption[]
) {
  return {
    enableColumnFilter: true,
    meta: {
      filter: type,
      filterOptions: options,
      filterOperator: type === "select" ? "eq" : "contains",
    } satisfies DataTableColumnFilterMeta,
  };
}

function filterMetaOf<TData>(column: Column<TData>): DataTableColumnFilterMeta {
  return (column.columnDef.meta ?? {}) as DataTableColumnFilterMeta;
}

type DataTableColumnFilterProps<TData> = {
  column: Column<TData>;
};

export function DataTableColumnFilter<TData>({
  column,
}: DataTableColumnFilterProps<TData>) {
  const translate = useTranslate();
  const meta = filterMetaOf(column);
  const columnRef = useRef(column);
  columnRef.current = column;
  const applied = String(column.getFilterValue() ?? "");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(applied);

  useEffect(() => {
    setValue(applied);
  }, [applied]);

  useEffect(() => {
    if (meta.filter !== "text") {
      return;
    }

    const handle = window.setTimeout(() => {
      const nextColumn = columnRef.current;
      const next = value.trim();
      const current = String(nextColumn.getFilterValue() ?? "").trim();
      if (next === current) {
        return;
      }
      nextColumn.setFilterValue(next || undefined);
    }, TABLE_DEFAULTS.searchDebounceMs);

    return () => window.clearTimeout(handle);
  }, [meta.filter, value]);

  if (!meta.filter) {
    return null;
  }

  const applySelect = (next: string) => {
    column.setFilterValue(next || undefined);
    setValue(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-5 shrink-0", {
            "text-primary": Boolean(applied),
            "text-muted-foreground": !applied,
          })}
        >
          <ListFilter className="size-3" />
          <span className="sr-only">{translate("buttons.filter")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        {meta.filter === "select" ? (
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              size="sm"
              variant={applied ? "ghost" : "secondary"}
              className="justify-start"
              onClick={() => applySelect("")}
            >
              {translate("table.filter.all")}
            </Button>
            {(meta.filterOptions ?? []).map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={applied === option.value ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => applySelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              autoFocus
              value={value}
              placeholder={translate("table.filter.text.placeholder")}
              onChange={(event) => setValue(event.target.value)}
            />
            {value ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="self-end"
                onClick={() => {
                  setValue("");
                  column.setFilterValue(undefined);
                }}
              >
                <X className="size-3.5" />
                {translate("buttons.clear")}
              </Button>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
