import { useMemo, useState } from "react";


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shared/ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Person } from "@/models/people/person.model";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatDate } from "@/lib/format";
import { useTranslate } from "@refinedev/core";
import { DataTablePagination } from "@/components/shared/refine-ui/data-table/data-table-pagination";
export interface GroupedPeopleByImportProps {
  records: Person[];
  directoryColumns: ColumnDef<Person>[];
}

export function GroupedPeopleByImport({ records, directoryColumns }: GroupedPeopleByImportProps) {
  const translate = useTranslate();
  const { locale } = useLocale();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Compute unique import dates for filter options
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    records.forEach((r) => {
      const d = formatDate(r.importedAt, locale);
      if (d) dates.add(d);
    });
    return Array.from(dates).sort();
  }, [records, locale]);

  // Enhance columns with filter options for importedAt
  const tableColumns = useMemo(() =>
    directoryColumns.map((col) => {
      if (col.id === "importedAt") {
        return {
          ...col,
          meta: {
            ...(col.meta ?? {}),
            filter: "select",
            filterOptions: uniqueDates.map((d) => ({ label: d, value: d })),
          },
        };
      }
      return col;
    }),
    [directoryColumns, uniqueDates]
  );

  // No custom import date filter UI; filtering handled by column filter on 'importedAt'
  const filteredRecords = useMemo(() => records, [records]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">

        <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map((col) => (
              <TableHead key={col.id}>
                {typeof col.header === 'function' ? col.header({} as any) : (col.header ?? col.id)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((person) => (
            <TableRow key={person.id}>
              {tableColumns.map((col) => (
                <TableCell key={col.id}>
                  {typeof col.cell === 'function'
                    ? col.cell({ row: { original: person } } as any)
                    : (person as any)[col.id!]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-end">
        <DataTablePagination
          currentPage={currentPage}
          pageCount={Math.ceil(filteredRecords.length / pageSize)}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          total={filteredRecords.length}
        />
      </div>
    </div>
  );
}
