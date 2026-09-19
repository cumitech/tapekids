"use client";

import { DataTableColumnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTableCards } from "@/components/shared/refine-ui/data-table/data-table-cards";
import { DataTablePagination } from "@/components/shared/refine-ui/data-table/data-table-pagination";
import { DataTableSearch } from "@/components/shared/refine-ui/data-table/data-table-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { cn } from "@/lib/utils";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import type { Column } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function isInternalIdColumn<TData>(column: Column<TData>) {
  return column.id === "id" || column.id === "entityId" || column.id === "q";
}

function serialNumber(page: number, size: number, index: number) {
  return (Math.max(page, 1) - 1) * size + index + 1;
}

type DataTableProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
  search?: boolean;
};

export function DataTable<TData extends BaseRecord>({
  table,
  search = true,
}: DataTableProps<TData>) {
  const translate = useTranslate();
  const {
    reactTable: { getHeaderGroups, getRowModel },
    refineCore: {
      tableQuery,
      currentPage,
      setCurrentPage,
      pageCount,
      pageSize,
      setPageSize,
    },
  } = table;

  const leafColumns = table.reactTable
    .getAllLeafColumns()
    .filter((column) => !isInternalIdColumn(column));
  const isLoading = tableQuery.isLoading;
  const visibleColumnCount = leafColumns.length + 1;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isOverflowing, setIsOverflowing] = useState({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current && tableContainerRef.current) {
        const table = tableRef.current;
        const container = tableContainerRef.current;

        const horizontalOverflow = table.offsetWidth > container.clientWidth;
        const verticalOverflow = table.offsetHeight > container.clientHeight;

        setIsOverflowing({
          horizontal: horizontalOverflow,
          vertical: verticalOverflow,
        });
      }
    };

    checkOverflow();

    // Check on window resize
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkOverflow);
    }

    // Check when table data changes
    const timeoutId = setTimeout(checkOverflow, 100);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkOverflow);
      }
      clearTimeout(timeoutId);
    };
  }, [tableQuery.data?.data, pageSize]);

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-4")}>
      {search ? <DataTableSearch table={table} /> : null}
      <DataTableCards
        rows={getRowModel().rows}
        isLoading={isLoading}
        pageSize={pageSize}
        currentPage={currentPage}
      />
      <div
        ref={tableContainerRef}
        className={cn(
          "hidden min-w-0 max-w-full overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:block dark:bg-card"
        )}
      >
        <Table
          ref={tableRef}
          className="w-full"
          style={{ tableLayout: "fixed" }}
        >
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10 text-xs sm:w-14">{translate("table.sn")}</TableHead>
                {headerGroup.headers
                  .filter((header) => !isInternalIdColumn(header.column))
                  .map((header) => {
                  const isPlaceholder = header.isPlaceholder;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "actions" &&
                          "bg-white dark:bg-card"
                      )}
                      style={{
                        ...getCommonStyles({
                          column: header.column,
                          isOverflowing: isOverflowing,
                        }),
                      }}
                    >
                      {isPlaceholder ? null : (
                        <div className={cn("flex", "items-center", "gap-1")}>
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          <DataTableColumnFilter column={header.column} />
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {isLoading ? (
              <>
                {Array.from({
                  length: pageSize < 1 ? 1 : pageSize,
                }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`} aria-hidden="true">
                    <TableCell className="w-14">
                      <div className="h-8" />
                    </TableCell>
                    {leafColumns.map((column) => (
                      <TableCell
                        key={`skeleton-cell-${rowIndex}-${column.id}`}
                        style={{
                          ...getCommonStyles({
                            column,
                            isOverflowing: isOverflowing,
                          }),
                        }}
                        className={cn("truncate")}
                      >
                        <div className="h-8" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={visibleColumnCount}
                    className={cn("absolute", "inset-0", "pointer-events-none")}
                  >
                    <Loader2
                      className={cn(
                        "absolute",
                        "top-1/2",
                        "left-1/2",
                        "animate-spin",
                        "text-primary",
                        "h-8",
                        "w-8",
                        "-translate-x-1/2",
                        "-translate-y-1/2"
                      )}
                    />
                  </TableCell>
                </TableRow>
              </>
            ) : getRowModel().rows?.length ? (
              getRowModel().rows.map((row, rowIndex) => {
                return (
                  <TableRow
                    key={String(row.original?.id ?? row.id)}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    <TableCell className="w-10 text-muted-foreground sm:w-14">
                      {serialNumber(currentPage, pageSize, rowIndex)}
                    </TableCell>
                    {row
                      .getVisibleCells()
                      .filter((cell) => !isInternalIdColumn(cell.column))
                      .map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === "actions" &&
                              "bg-white dark:bg-card"
                          )}
                          style={{
                            ...getCommonStyles({
                              column: cell.column,
                              isOverflowing: isOverflowing,
                            }),
                          }}
                        >
                        <div
                          className={
                            cell.column.id === "actions"
                              ? "flex justify-end overflow-visible"
                              : "min-w-0 truncate"
                          }
                        >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <DataTableNoData
                isOverflowing={isOverflowing}
                columnsLength={visibleColumnCount}
              />
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && getRowModel().rows?.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          total={tableQuery.data?.total}
        />
      )}
    </div>
  );
}

function DataTableNoData({
  isOverflowing,
  columnsLength,
}: {
  isOverflowing: { horizontal: boolean; vertical: boolean };
  columnsLength: number;
}) {
  const translate = useTranslate();

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={columnsLength}
        className={cn("relative", "text-center")}
        style={{ height: "490px" }}
      >
        <div
          className={cn(
            "absolute",
            "inset-0",
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            "gap-2",
            "bg-background"
          )}
          style={{
            position: isOverflowing.horizontal ? "sticky" : "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: isOverflowing.horizontal ? 2 : 1,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div className={cn("text-lg", "font-semibold", "text-foreground")}>
            {translate("table.emptyTitle")}
          </div>
          <div className={cn("text-sm", "text-muted-foreground")}>
            {translate("table.emptyDescription")}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function getCommonStyles<TData>({
  column,
  isOverflowing,
}: {
  column: Column<TData>;
  isOverflowing: {
    horizontal: boolean;
    vertical: boolean;
  };
}): React.CSSProperties {
  if (column.id === "actions") {
    return {
      position: "sticky",
      right: 0,
      width: 112,
      minWidth: 112,
      maxWidth: 112,
      zIndex: 2,
      boxShadow: isOverflowing.horizontal
        ? "-8px 0 12px -8px rgba(15, 23, 42, 0.18)"
        : undefined,
    };
  }

  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow:
      isOverflowing.horizontal && isLastLeftPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isOverflowing.horizontal && isFirstRightPinnedColumn
        ? "4px 0 4px -4px var(--border) inset"
        : undefined,
    left:
      isOverflowing.horizontal && isPinned === "left"
        ? `${column.getStart("left")}px`
        : undefined,
    right:
      isOverflowing.horizontal && isPinned === "right"
        ? `${column.getAfter("right")}px`
        : undefined,
    opacity: 1,
    position: isOverflowing.horizontal && isPinned ? "sticky" : "relative",
    background: isOverflowing.horizontal && isPinned ? "var(--background)" : "",
    borderTopRightRadius:
      isOverflowing.horizontal && isPinned === "right"
        ? "var(--radius)"
        : undefined,
    borderBottomRightRadius:
      isOverflowing.horizontal && isPinned === "right"
        ? "var(--radius)"
        : undefined,
    borderTopLeftRadius:
      isOverflowing.horizontal && isPinned === "left"
        ? "var(--radius)"
        : undefined,
    borderBottomLeftRadius:
      isOverflowing.horizontal && isPinned === "left"
        ? "var(--radius)"
        : undefined,
    width: "auto",
    minWidth: 0,
    maxWidth: "1px",
    overflow: "hidden",
    zIndex: isOverflowing.horizontal && isPinned ? 1 : 0,
  };
}

DataTable.displayName = "DataTable";
