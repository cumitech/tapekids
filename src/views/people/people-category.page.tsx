"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CrudFilter } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PeopleImportDialog } from "@/components/people/people-import-dialog";
import { PersonForm } from "@/components/people/person-form.component";
import { useAppModal } from "@/components/shared/modals/app-modal";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { isPersonCategory, type PersonCategory } from "@/constants/person";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { usePeopleDirectoryColumns } from "@/hooks/people/use-people-directory-columns.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { clearListQueryCache } from "@/lib/client/list-query-cache";
import type { Person } from "@/models/people/person.model";

type PeopleCategoryPageProps = {
  category: string;
};

function matchingPeopleQuery(filters: CrudFilter[]) {
  const params = new URLSearchParams();
  params.set("idsOnly", "true");
  params.set("_start", "0");
  params.set("_end", "1");
  for (const filter of filters) {
    if (!("field" in filter)) {
      continue;
    }
    if (filter.value == null || filter.value === "") {
      continue;
    }
    const text = String(filter.value);
    if (filter.operator === "eq") {
      params.set(filter.field, text);
    } else if (filter.operator === "contains") {
      params.set(`${filter.field}_like`, text);
    }
  }
  return params;
}

function onlyCategoryFilter(filters: CrudFilter[], category: PersonCategory) {
  return filters.every((filter) => {
    if (!("field" in filter)) {
      return true;
    }
    if (filter.value == null || filter.value === "") {
      return true;
    }
    return filter.field === "category" && String(filter.value) === category;
  });
}

export function PeopleCategoryPage({ category }: PeopleCategoryPageProps) {
  const translate = useTranslate();
  const { path } = useLocale();
  const { confirm } = useAppModal();
  const { openEdit } = useDashboardFormModal();
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [selectingAll, setSelectingAll] = useState(false);
  const pageIdsRef = useRef<string[]>([]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const toggleRow = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const togglePage = useCallback(() => {
    const ids = pageIdsRef.current;
    setSelected((current) => {
      const allOn = ids.length > 0 && ids.every((id) => current.has(id));
      const next = new Set(current);
      if (allOn) {
        for (const id of ids) {
          next.delete(id);
        }
      } else {
        for (const id of ids) {
          next.add(id);
        }
      }
      return next;
    });
  }, []);

  const renderActions = useCallback(
    (row: Person) => (
      <ResourceRowActions
        id={row.id}
        onEdit={() =>
          openEdit("people", row.id, ({ close }) => (
            <PersonForm
              mode="edit"
              id={row.id}
              onCancel={close}
              onSuccess={close}
            />
          ))
        }
      />
    ),
    [openEdit]
  );
  const directoryColumns = usePeopleDirectoryColumns<Person>({
    renderActions,
  });

  const columns = useMemo<ColumnDef<Person>[]>(() => {
    const selectColumn: ColumnDef<Person> = {
      id: "select",
      enableSorting: false,
      enableColumnFilter: false,
      header: () => {
        const ids = pageIdsRef.current;
        const current = selectedRef.current;
        const allOn = ids.length > 0 && ids.every((id) => current.has(id));
        const someOn = ids.some((id) => current.has(id));
        return (
          <Checkbox
            checked={allOn ? true : someOn ? "indeterminate" : false}
            onCheckedChange={togglePage}
            aria-label={translate("people.bulkDelete.selectPage")}
          />
        );
      },
      cell: ({ row }) => {
        const id = String(row.original.id);
        return (
          <Checkbox
            checked={selectedRef.current.has(id)}
            onCheckedChange={() => toggleRow(id)}
            aria-label={translate("people.bulkDelete.selectRow")}
          />
        );
      },
    };
    return [selectColumn, ...directoryColumns];
  }, [directoryColumns, togglePage, toggleRow, translate]);

  const permanentFilters = useMemo<CrudFilter[]>(
    () =>
      isPersonCategory(category)
        ? [{ field: "category", operator: "eq", value: category }]
        : [],
    [category]
  );

  const { table, records } = useCachedTable<Person>({
    resource: "people",
    columns,
    permanentFilters,
  });

  pageIdsRef.current = records.map((row) => String(row.id));
  const pageIds = pageIdsRef.current;
  const total = table.refineCore.tableQuery.data?.total ?? 0;
  const filters = table.refineCore.filters;
  const filterKey = JSON.stringify(filters);
  const pageFullySelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const categoryLabel = isPersonCategory(category)
    ? translate(`people.categories.${category}`)
    : category;

  useEffect(() => {
    setSelected(new Set());
  }, [filterKey]);

  async function selectEverything() {
    setSelectingAll(true);
    try {
      const params = matchingPeopleQuery(filters);
      const rows = await apiGet<Array<{ id: string }>>(`/people?${params.toString()}`);
      setSelected(new Set(rows.map((row) => String(row.id))));
    } catch (err) {
      toast.error(apiErrorMessage(err, translate("people.bulkDelete.failed")));
    } finally {
      setSelectingAll(false);
    }
  }

  function refresh() {
    clearListQueryCache("people");
    void table.refineCore.tableQuery.refetch();
  }

  function askDelete() {
    if (!isPersonCategory(category) || selected.size === 0) {
      return;
    }
    const count = selected.size;
    const ids = Array.from(selected);
    const deleteAll =
      count >= total && total > 0 && onlyCategoryFilter(filters, category);
    confirm({
      title: translate("people.bulkDelete.confirmTitle"),
      description: translate("people.bulkDelete.confirmDescription", {
        count,
        category: categoryLabel,
      }),
      confirmLabel: translate("buttons.delete"),
      cancelLabel: translate("buttons.cancel"),
      destructive: true,
      onConfirm: async () => {
        try {
          const result = await apiPost<{ deleted: number }>("/people/bulk-delete", {
            category,
            ...(deleteAll ? { all: true } : { ids }),
          });
          setSelected(new Set());
          refresh();
          toast.success(
            translate("people.bulkDelete.success", { count: result.deleted })
          );
        } catch (err) {
          toast.error(apiErrorMessage(err, translate("people.bulkDelete.failed")));
          throw err;
        }
      },
    });
  }

  if (!isPersonCategory(category)) {
    return <ErrorComponent />;
  }

  return (
    <ListView>
      <ListViewHeader canCreate={false} title={categoryLabel}>
        <Button variant="outline" asChild>
          <Link href={path("/dashboard/people")}>
            <ChevronLeft className="size-4" />
            {translate("people.summary.back")}
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {translate("people.import.action")}
        </Button>
      </ListViewHeader>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={selectingAll || total === 0 || (selected.size >= total && total > 0)}
          onClick={() => void selectEverything()}
        >
          {selectingAll ? <Loader2 className="size-4 animate-spin" /> : null}
          {translate("people.bulkDelete.selectAll", { count: total })}
        </Button>
        {selected.size > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {translate("people.bulkDelete.selected", { count: selected.size })}
            </span>
            <Button type="button" variant="ghost" onClick={() => setSelected(new Set())}>
              {translate("people.bulkDelete.clear")}
            </Button>
            <Button type="button" variant="destructive" onClick={askDelete}>
              {translate("people.bulkDelete.action")}
            </Button>
          </>
        ) : null}
      </div>
      {pageFullySelected && total > pageIds.length && selected.size < total ? (
        <p className="text-sm text-muted-foreground">
          {translate("people.bulkDelete.pageSelected")}
        </p>
      ) : null}
      <DataTable table={table} />
      <PeopleImportDialog
        open={importOpen}
        lockedCategory={category}
        onOpenChange={setImportOpen}
        onImported={() => {
          setSelected(new Set());
          refresh();
        }}
      />
    </ListView>
  );
}
