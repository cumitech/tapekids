"use client";

import Link from "next/link";
import { ChevronLeft, Loader2, Upload } from "lucide-react";

import { PeopleImportForm } from "@/components/people/people-import-form";
import { PersonForm } from "@/components/people/person-form.component";
import { useAppModal } from "@/components/shared/modals/app-modal";
import { DeleteConfirmPopover } from "@/components/shared/refine-ui/buttons/delete-confirm-popover";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { Button } from "@/components/shared/ui/button";
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
