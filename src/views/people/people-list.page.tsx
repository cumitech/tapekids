"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslate } from "@refinedev/core";
import { ChevronRight, Loader2, Upload } from "lucide-react";

import { PeopleImportDialog } from "@/components/people/people-import-dialog";
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
import { PERSON_CATEGORY_VALUES, type PersonCategory } from "@/constants/person";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet } from "@/lib/client/api";
import { cn } from "@/lib/utils";

type CategorySummary = {
  category: PersonCategory;
  count: number;
};

type PreviewPerson = {
  id: string;
  fullName?: string | null;
  yfId?: string | null;
  email?: string | null;
};

const PREVIEW_LIMIT = 8;

function CategoryPeoplePreview({
  category,
  count,
}: {
  category: PersonCategory;
  count: number;
}) {
  const translate = useTranslate();
  const translateRef = useRef(translate);
  translateRef.current = translate;
  const [people, setPeople] = useState<PreviewPerson[] | null>(count === 0 ? [] : null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (count === 0) {
      setPeople([]);
      return;
    }
    let cancelled = false;
    setPeople(null);
    setError("");
    const params = new URLSearchParams({
      category,
      _start: "0",
      _end: String(PREVIEW_LIMIT),
      _sort: "fullName",
      _order: "asc",
    });
    apiGet<PreviewPerson[]>(`/people?${params.toString()}`)
      .then((result) => {
        if (!cancelled) {
          setPeople(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(apiErrorMessage(err, translateRef.current("people.summary.failed")));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category, count]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!people) {
    return <Loader2 className="size-5 animate-spin text-primary" />;
  }
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">{translate("people.summary.previewEmpty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">{translate("people.fields.yfId")}</TableHead>
            <TableHead className="w-[34%]">{translate("people.fields.fullName")}</TableHead>
            <TableHead>{translate("people.fields.email")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                {person.yfId || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">
                {person.fullName || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {person.email || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {count > people.length ? (
        <p className="text-sm text-muted-foreground">
          {translate("people.summary.previewMore", { shown: people.length, count })}
        </p>
      ) : null}
    </div>
  );
}

export function PeopleListPage() {
  const translate = useTranslate();
  const { path } = useLocale();
  const router = useRouter();
  const [rows, setRows] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<PersonCategory>>(() => new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [summaryVersion, setSummaryVersion] = useState(0);
  const translateRef = useRef(translate);
  translateRef.current = translate;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<CategorySummary[]>("/people/summary")
      .then((result) => {
        if (!cancelled) {
          setRows(result);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(apiErrorMessage(err, translateRef.current("people.summary.failed")));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [summaryVersion]);

  function toggleCategory(category: PersonCategory) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const summaries =
    rows.length > 0
      ? rows
      : error
        ? []
        : PERSON_CATEGORY_VALUES.map((category) => ({ category, count: 0 }));

  return (
    <ListView>
      <ListViewHeader canCreate={false}>
        <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {translate("people.import.action")}
        </Button>
      </ListViewHeader>
      {/* <p className="text-sm text-muted-foreground">{translate("people.summary.hint")}</p> */}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="hidden min-w-0 overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] md:block dark:bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{translate("people.fields.category")}</TableHead>
              <TableHead className="w-32">{translate("people.summary.people")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{translate("people.summary.open")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : (
              summaries.map((row) => {
                const href = path(`/dashboard/people/category/${row.category}`);
                const label = translate(`people.categories.${row.category}`);
                const open = openCategories.has(row.category);
                return (
                  <CategorySummaryRows
                    key={row.category}
                    href={href}
                    label={label}
                    count={row.count}
                    open={open}
                    expandLabel={translate(open ? "people.summary.collapse" : "people.summary.expand", {
                      category: label,
                    })}
                    onOpen={() => router.push(href)}
                    onToggle={() => toggleCategory(row.category)}
                    preview={<CategoryPeoplePreview category={row.category} count={row.count} />}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {loading ? (
          <li className="flex h-24 items-center justify-center rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
            <Loader2 className="size-6 animate-spin text-primary" />
          </li>
        ) : (
          summaries.map((row) => {
            const href = path(`/dashboard/people/category/${row.category}`);
            const label = translate(`people.categories.${row.category}`);
            const open = openCategories.has(row.category);
            return (
              <li
                key={row.category}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card"
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <Link href={href} className="min-w-0 flex-1 px-2 py-2">
                    <span className="block font-medium">{label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {translate("people.summary.count", { count: row.count })}
                    </span>
                  </Link>
                  <CategoryToggle
                    open={open}
                    label={translate(open ? "people.summary.collapse" : "people.summary.expand", {
                      category: label,
                    })}
                    onToggle={() => toggleCategory(row.category)}
                  />
                </div>
                {open ? (
                  <div className="border-t border-border/60 bg-muted/40 px-4 py-3">
                    <CategoryPeoplePreview category={row.category} count={row.count} />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
      <PeopleImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => setSummaryVersion((version) => version + 1)}
      />
    </ListView>
  );
}

function CategoryToggle({
  open,
  label,
  onToggle,
}: {
  open: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 md:size-8"
      aria-expanded={open}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onToggle();
      }}
    >
      <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
    </button>
  );
}

function CategorySummaryRows({
  href,
  label,
  count,
  open,
  expandLabel,
  onOpen,
  onToggle,
  preview,
}: {
  href: string;
  label: string;
  count: number;
  open: boolean;
  expandLabel: string;
  onOpen: () => void;
  onToggle: () => void;
  preview: ReactNode;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        <TableCell>
          <Link href={href} className="font-medium" onClick={(event) => event.stopPropagation()}>
            {label}
          </Link>
        </TableCell>
        <TableCell>{count}</TableCell>
        <TableCell>
          <CategoryToggle open={open} label={expandLabel} onToggle={onToggle} />
        </TableCell>
      </TableRow>
      {open ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="bg-muted/40">
            {preview}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
