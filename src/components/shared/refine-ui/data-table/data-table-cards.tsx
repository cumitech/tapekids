"use client";

import type { BaseRecord } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";
import type { Column, Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const HIDDEN_MOBILE_COLUMNS = new Set([
  "region",
  "division",
  "subDivision",
  "churchName",
]);

function isInternalIdColumn<TData>(column: Column<TData>) {
  return column.id === "id" || column.id === "entityId" || column.id === "q";
}

function isMediaColumn<TData>(column: Column<TData>) {
  return column.id === "imageUrl" || column.id === "image";
}

function columnLabel<TData>(column: Column<TData>): ReactNode {
  const header = column.columnDef.header;
  if (typeof header === "string" || typeof header === "number") {
    return header;
  }
  return column.id;
}

function serialNumber(page: number, size: number, index: number) {
  return (Math.max(page, 1) - 1) * size + index + 1;
}

function combinedPersonName<TData extends BaseRecord>(row: Row<TData>) {
  const record = row.original as Record<string, unknown>;
  const first = String(record.firstName ?? "").trim();
  const last = String(record.lastName ?? "").trim();
  if (!first && !last) {
    return null;
  }
  return [first, last].filter(Boolean).join(" ");
}

function isBlankValue(value: unknown) {
  if (value == null) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return false;
}

type DataTableCardsProps<TData extends BaseRecord> = {
  rows: Row<TData>[];
  isLoading: boolean;
  pageSize: number;
  currentPage: number;
};

export function DataTableCards<TData extends BaseRecord>({
  rows,
  isLoading,
  pageSize,
  currentPage,
}: DataTableCardsProps<TData>) {
  const translate = useTranslate();

  if (isLoading) {
    return (
      <div className="relative flex flex-col gap-3 md:hidden">
        {Array.from({ length: Math.min(pageSize, 5) }).map((_, index) => (
          <div
            key={`card-skeleton-${index}`}
            className="h-32 rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card"
          />
        ))}
        <Loader2 className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 py-16 text-center shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:hidden dark:bg-card">
        <p className="text-lg font-semibold text-foreground">
          {translate("table.emptyTitle")}
        </p>
        <p className="text-sm text-muted-foreground">
          {translate("table.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {rows.map((row, rowIndex) => {
        const personName = combinedPersonName(row);
        const cells = row
          .getVisibleCells()
          .filter((cell) => !isInternalIdColumn(cell.column));
        const media = cells.find((cell) => isMediaColumn(cell.column));
        const actions = cells.find((cell) => cell.column.id === "actions");
        const fields = cells.filter((cell) => {
          if (cell.column.id === "actions" || isMediaColumn(cell.column)) {
            return false;
          }
          if (HIDDEN_MOBILE_COLUMNS.has(cell.column.id)) {
            return false;
          }
          if (personName && (cell.column.id === "firstName" || cell.column.id === "lastName")) {
            return false;
          }
          return true;
        });
        const [titleCell, ...rest] = fields;
        const detailSource = personName ? fields : rest;
        const detailCells = detailSource.filter((cell) => {
          const def = cell.column.columnDef;
          const hasAccessor =
            ("accessorKey" in def && Boolean(def.accessorKey)) ||
            ("accessorFn" in def && Boolean(def.accessorFn));
          if (!hasAccessor) {
            return true;
          }
          return !isBlankValue(cell.getValue());
        });
        const title = personName ?? titleCell;

        return (
          <li
            key={String(row.original?.id ?? row.id)}
            className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card"
          >
            <div className="flex items-start gap-3 p-4">
              {media ? (
                <div className="shrink-0 overflow-hidden rounded-xl">
                  {flexRender(
                    media.column.columnDef.cell,
                    media.getContext()
                  )}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  #{serialNumber(currentPage, pageSize, rowIndex)}
                </p>
                {typeof title === "string" ? (
                  <h3 className="mt-0.5 text-lg font-semibold leading-snug break-words text-foreground">
                    {title}
                  </h3>
                ) : title ? (
                  <div className="mt-0.5 text-lg font-semibold leading-snug break-words">
                    {flexRender(
                      title.column.columnDef.cell,
                      title.getContext()
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            {detailCells.length > 0 ? (
              <dl className="grid gap-3 border-t border-border/60 bg-muted/30 px-4 py-3">
                {detailCells.map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {columnLabel(cell.column)}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed break-words text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {actions ? (
              <div className="flex justify-end border-t border-border/60 px-3 py-3">
                {flexRender(
                  actions.column.columnDef.cell,
                  actions.getContext()
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
