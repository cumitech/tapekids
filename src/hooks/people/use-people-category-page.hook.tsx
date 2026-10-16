"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CrudFilter } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { AssignYfIdButton } from "@/components/people/assign-yf-id-button";
import { PersonForm } from "@/components/people/person-form.component";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { isPersonCategory, type PersonCategory } from "@/constants/person";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { usePeopleDirectoryColumns } from "@/hooks/people/use-people-directory-columns.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { invalidateListCaches } from "@/lib/client/invalidate-lists";
import {
  matchingPeopleQuery,
  onlyCategoryFilter,
} from "@/lib/people/list-query";
import type { Person } from "@/models/people/person.model";

export function usePeopleCategoryPage(category: string) {
  const translate = useTranslate();
  const { path } = useLocale();
  const { openCreate, openEdit } = useDashboardFormModal();
  const refreshRef = useRef<() => void>(() => undefined);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [selectingAll, setSelectingAll] = useState(false);
  const pageIdsRef = useRef<string[]>([]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const valid = isPersonCategory(category);

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
        resource="people"
        id={row.id}
        onEdit={() =>
          openEdit("people", row.id, ({ close }) => (
            <PersonForm
              mode="edit"
              id={row.id}
              onCancel={close}
              onSuccess={() => {
                close();
                refreshRef.current();
              }}
            />
          ))
        }
      >
        <AssignYfIdButton
          personId={row.id}
          fullName={row.fullName}
          yfId={row.yfId}
          onSaved={() => refreshRef.current()}
        />
      </ResourceRowActions>
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
      valid
        ? [{ field: "category", operator: "eq", value: category }]
        : [],
    [category, valid]
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
  const categoryLabel = valid
    ? translate(`people.categories.${category}`)
    : category;

  useEffect(() => {
    setSelected(new Set());
  }, [filterKey]);

  function refresh() {
    invalidateListCaches("people");
    void table.refineCore.tableQuery.refetch();
  }
  refreshRef.current = refresh;

  async function selectEverything() {
    setSelectingAll(true);
    try {
      const params = matchingPeopleQuery(filters);
      const rows = await apiGet<Array<{ id: string }>>(
        `/people?${params.toString()}`
      );
      setSelected(new Set(rows.map((row) => String(row.id))));
    } catch (err) {
      toast.error(apiErrorMessage(err, translate("people.bulkDelete.failed")));
    } finally {
      setSelectingAll(false);
    }
  }

  async function deleteSelected() {
    if (!valid || selected.size === 0) {
      return;
    }
    const count = selected.size;
    const ids = Array.from(selected);
    const deleteAll =
      count >= total &&
      total > 0 &&
      onlyCategoryFilter(filters, category as PersonCategory);
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
  }

  return {
    valid,
    table,
    translate,
    path,
    category: category as PersonCategory,
    categoryLabel,
    selected,
    selectingAll,
    total,
    pageIds,
    pageFullySelected,
    selectEverything,
    clearSelection: () => setSelected(new Set()),
    deleteSelected,
    refresh,
    openCreate,
    openEdit,
  };
}
