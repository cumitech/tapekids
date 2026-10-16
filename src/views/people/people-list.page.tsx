"use client";

import Link from "next/link";
import { Loader2, Upload } from "lucide-react";

import { PeopleImportForm } from "@/components/people/people-import-form";
import { PersonForm } from "@/components/people/person-form.component";
import { useAppModal } from "@/components/shared/modals/app-modal";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { usePeopleListPage } from "@/hooks/people/use-people-list.hook";
import { CategoryPeoplePreview } from "@/views/people/category-people-preview";
import { CategorySummaryRows } from "@/views/people/category-summary-rows";
import { CategoryToggle } from "@/views/people/category-toggle";

export function PeopleListPage() {
  const page = usePeopleListPage();
  const { openModal, closeModal } = useAppModal();

  return (
    <ListView>
      <ListViewHeader
        onCreate={() =>
          page.openCreate("people", ({ close }) => (
            <PersonForm
              mode="create"
              onCancel={close}
              onSuccess={() => {
                close();
                page.reloadSummary();
              }}
            />
          ))
        }
      >
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            openModal({
              title: page.translate("people.import.title"),
              className: "sm:max-w-lg",
              body: (
                <PeopleImportForm
                  onCancel={closeModal}
                  onImported={page.reloadSummary}
                />
              ),
            })
          }
        >
          <Upload className="mr-2 h-4 w-4" />
          {page.translate("people.import.action")}
        </Button>
      </ListViewHeader>
      {page.error ? (
        <p className="text-sm text-destructive">{page.error}</p>
      ) : null}
      <div className="hidden min-w-0 overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:block dark:bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{page.translate("people.fields.category")}</TableHead>
              <TableHead className="w-32">
                {page.translate("people.summary.people")}
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">
                  {page.translate("people.summary.open")}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : (
              page.summaries.map((row) => {
                const href = page.path(
                  `/dashboard/people/category/${row.category}`
                );
                const label = page.translate(
                  `people.categories.${row.category}`
                );
                const open = page.openCategories.has(row.category);
                return (
                  <CategorySummaryRows
                    key={row.category}
                    href={href}
                    label={label}
                    count={row.count}
                    open={open}
                    expandLabel={page.translate(
                      open
                        ? "people.summary.collapse"
                        : "people.summary.expand",
                      { category: label }
                    )}
                    onOpen={() => page.router.push(href)}
                    onToggle={() => page.toggleCategory(row.category)}
                    preview={
                      <CategoryPeoplePreview
                        category={row.category}
                        count={row.count}
                      />
                    }
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {page.loading ? (
          <li className="flex h-24 items-center justify-center rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
            <Loader2 className="size-6 animate-spin text-primary" />
          </li>
        ) : (
          page.summaries.map((row) => {
            const href = page.path(
              `/dashboard/people/category/${row.category}`
            );
            const label = page.translate(`people.categories.${row.category}`);
            const open = page.openCategories.has(row.category);
            return (
              <li
                key={row.category}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card"
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <Link href={href} className="min-w-0 flex-1 px-2 py-2">
                    <span className="block font-medium">{label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {page.translate("people.summary.count", {
                        count: row.count,
                      })}
                    </span>
                  </Link>
                  <CategoryToggle
                    open={open}
                    label={page.translate(
                      open
                        ? "people.summary.collapse"
                        : "people.summary.expand",
                      { category: label }
                    )}
                    onToggle={() => page.toggleCategory(row.category)}
                  />
                </div>
                {open ? (
                  <div className="border-t border-border/60 bg-muted/40 px-4 py-3">
                    <CategoryPeoplePreview
                      category={row.category}
                      count={row.count}
                    />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </ListView>
  );
}
