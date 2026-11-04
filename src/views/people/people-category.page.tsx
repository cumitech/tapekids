"use client";

import Link from "next/link";
import { ChevronLeft, Filter, Loader2, Upload } from "lucide-react";

import { PeopleImportForm } from "@/components/people/people-import-form";
import { ImportBatchHistory } from "@/components/people/import-batch-history";
import { PersonForm } from "@/components/people/person-form.component";
import { useAppModal } from "@/components/shared/modals/app-modal";
import { DeleteConfirmPopover } from "@/components/shared/refine-ui/buttons/delete-confirm-popover";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { Button } from "@/components/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { Label } from "@/components/shared/ui/label";
import { usePeopleCategoryPage } from "@/hooks/people/use-people-category.hook";

type PeopleCategoryPageProps = {
  category: string;
};

export function PeopleCategoryPage({ category }: PeopleCategoryPageProps) {
  const page = usePeopleCategoryPage(category);
  const { openModal, closeModal } = useAppModal();

  if (!page.valid) {
    return <ErrorComponent />;
  }

  return (
    <ListView>
      <ListViewHeader
        resource="people"
        title={page.categoryLabel}
        onCreate={() =>
          page.openCreate("people", ({ close }) => (
            <PersonForm
              mode="create"
              defaultCategory={page.category}
              onCancel={close}
              onSuccess={() => {
                close();
                page.refresh();
              }}
            />
          ))
        }
      >
        <Button variant="outline" asChild>
          <Link href={page.path("/dashboard/people")}>
            <ChevronLeft className="size-4" />
            {page.translate("people.summary.back")}
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            openModal({
              title: page.translate("people.import.title"),
              className: "sm:max-w-lg",
              body: (
                <PeopleImportForm
                  lockedCategory={page.category}
                  onCancel={closeModal}
                  onImported={() => {
                    page.clearSelection();
                    page.refresh();
                    page.reloadImportBatches();
                  }}
                />
              ),
            })
          }
        >
          <Upload className="mr-2 h-4 w-4" />
          {page.translate("people.import.action")}
        </Button>
      </ListViewHeader>
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <Label
              htmlFor="people-import-batch-filter"
              className="text-base font-semibold"
            >
              {page.translate("people.import.batchFilter")}
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {page.translate("people.import.batchFilterHint")}
            </p>
          </div>
        </div>
        <Select
          value={page.selectedImportBatch || "all"}
          onValueChange={(value) =>
            page.table.reactTable
              .getColumn("importedAt")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
          disabled={page.importBatchesLoading}
        >
          <SelectTrigger
            id="people-import-batch-filter"
            className="h-12 w-full border-primary/25 bg-background text-base shadow-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {page.translate("people.import.allBatches")}
            </SelectItem>
            {page.importBatchOptions.map((batch) => (
              <SelectItem key={batch.value} value={batch.value}>
                {batch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {page.selectedImportBatch
              ? page.translate("people.import.showingBatch", {
                  batch:
                    page.importBatchOptions.find(
                      (batch) => batch.value === page.selectedImportBatch
                    )?.label ?? "",
                  count: page.total,
                })
              : page.translate("people.import.showingAllPeople", {
                  count: page.total,
                })}
          </p>
          {page.selectedImportBatch ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                page.table.reactTable
                  .getColumn("importedAt")
                  ?.setFilterValue(undefined)
              }
            >
              {page.translate("people.import.clearBatchFilter")}
            </Button>
          ) : null}
        </div>
        {page.category !== "trophy_participant" ? (
          <ImportBatchHistory
            category={page.category}
            refreshKey={page.importHistoryRefreshKey}
          />
        ) : null}
        {page.importBatchError ? (
          <p className="mt-2 text-sm text-destructive">{page.importBatchError}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={
            page.selectingAll ||
            page.total === 0 ||
            (page.selected.size >= page.total && page.total > 0)
          }
          onClick={() => void page.selectEverything()}
        >
          {page.selectingAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {page.translate("people.bulkDelete.selectAll", { count: page.total })}
        </Button>
        {page.selected.size > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {page.translate("people.bulkDelete.selected", {
                count: page.selected.size,
              })}
            </span>
            <Button type="button" variant="ghost" onClick={page.clearSelection}>
              {page.translate("people.bulkDelete.clear")}
            </Button>
            <DeleteConfirmPopover
              title={page.translate("people.bulkDelete.confirmTitle")}
              description={page.translate("people.bulkDelete.confirmDescription", {
                count: page.selected.size,
                category: page.categoryLabel,
              })}
              onConfirm={page.deleteSelected}
            >
              <Button type="button" variant="destructive">
                {page.translate("people.bulkDelete.action")}
              </Button>
            </DeleteConfirmPopover>
          </>
        ) : null}
      </div>
      {page.pageFullySelected &&
      page.total > page.pageIds.length &&
      page.selected.size < page.total ? (
        <p className="text-sm text-muted-foreground">
          {page.translate("people.bulkDelete.pageSelected")}
        </p>
      ) : null}
      <DataTable table={page.table} />
    </ListView>
  );
}
