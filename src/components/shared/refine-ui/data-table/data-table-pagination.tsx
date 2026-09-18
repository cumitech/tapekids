"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";

type DataTablePaginationProps = {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total?: number;
};

export function DataTablePagination({
  currentPage,
  pageCount,
  setCurrentPage,
  pageSize,
  setPageSize,
  total,
}: DataTablePaginationProps) {
  const translate = useTranslate();
  const pageSizeOptions = useMemo(() => {
    const baseOptions = [10, 20, 30, 40, 50];
    const optionsSet = new Set(baseOptions);

    if (!optionsSet.has(pageSize)) {
      optionsSet.add(pageSize);
    }

    return Array.from(optionsSet).sort((a, b) => a - b);
  }, [pageSize]);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center justify-between gap-3 px-0 sm:px-2"
      )}
    >
      <div className={cn("min-w-0 flex-1 text-sm text-muted-foreground")}>
        {typeof total === "number"
          ? translate("table.rows", { count: total })
          : null}
      </div>
      <div className={cn("flex", "items-center", "flex-wrap", "gap-2")}>
        <div className={cn("flex", "items-center", "gap-2")}>
          <span className={cn("hidden text-sm font-medium sm:inline")}>
            {translate("table.rowsPerPage")}
          </span>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className={cn("h-8", "w-[70px]")}>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={cn("flex", "items-center", "flex-wrap", "gap-2")}>
          <div
            className={cn(
              "flex",
              "items-center",
              "justify-center",
              "text-sm",
              "font-medium"
            )}
          >
            {translate("table.pageOf", {
              current: currentPage,
              total: pageCount,
            })}
          </div>
          <div className={cn("flex", "items-center", "gap-2")}>
            <Button
              variant="outline"
              className={cn("hidden", "h-8", "w-8", "p-0", "lg:flex")}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label={translate("table.firstPage")}
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className={cn("h-8", "w-8", "p-0")}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={translate("table.previousPage")}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className={cn("h-8", "w-8", "p-0")}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label={translate("table.nextPage")}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className={cn("hidden", "h-8", "w-8", "p-0", "lg:flex")}
              onClick={() => setCurrentPage(pageCount)}
              disabled={currentPage === pageCount}
              aria-label={translate("table.lastPage")}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

DataTablePagination.displayName = "DataTablePagination";
