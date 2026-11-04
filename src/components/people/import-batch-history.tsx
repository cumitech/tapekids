"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import type { PersonCategory } from "@/constants/person";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet } from "@/lib/client/api";
import { formatImportBatchLabel } from "@/lib/format";
import type { PeopleImportHistoryItem } from "@/models/people/people-import.model";

export function ImportBatchHistory({
  category,
  refreshKey,
}: {
  category: PersonCategory;
  refreshKey: number;
}) {
  const translate = useTranslate();
  const { locale, path } = useLocale();
  const [batches, setBatches] = useState<PeopleImportHistoryItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setBatches(null);
    apiGet<PeopleImportHistoryItem[]>(
      `/people/import-history?category=${category}`
    )
      .then((result) => {
        if (active) {
          setBatches(result);
          setError("");
        }
      })
      .catch((cause) => {
        if (active) {
          setError(
            apiErrorMessage(cause, translate("people.import.historyFailed"))
          );
          setBatches([]);
        }
      });
    return () => {
      active = false;
    };
  }, [category, refreshKey, translate]);

  return (
    <details
      id="import-history"
      className="group rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card sm:p-5"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-3">
          <ChevronRight
            aria-hidden="true"
            className="mt-1 size-4 text-muted-foreground transition-transform group-open:rotate-90"
          />
          <div>
            <h2 className="text-base font-semibold">
              {translate("people.import.historyTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {translate("people.import.historyHint")}
            </p>
          </div>
        </div>
        {batches ? (
          <Badge variant="outline">
            {translate("people.import.historyCount", {
              count: batches.length,
            })}
          </Badge>
        ) : null}
      </summary>

      <div className="mt-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!batches && !error ? (
          <Loader2 className="size-5 animate-spin text-primary" />
        ) : null}
        {batches?.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">
            {translate("people.import.historyEmpty")}
          </p>
        ) : null}
        {batches && batches.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {batches.map((batch) => (
              <li
                key={batch.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium tabular-nums">
                      {formatImportBatchLabel(batch.importedAt, locale)}
                    </span>
                    <Badge variant="secondary">
                      {translate(`people.categories.${batch.category}`)}
                    </Badge>
                  </div>
                  {batch.recorded ? (
                    <>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {batch.fileName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {translate("people.import.historySummary", {
                          total: batch.totalProcessed,
                          created: batch.created,
                          updated: batch.updated,
                          unchanged: batch.unchanged,
                          skipped: batch.skipped,
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {translate("people.import.legacyHistorySummary", {
                        count: batch.totalProcessed,
                      })}
                    </p>
                  )}
                  {batch.mailingList ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {translate("people.import.historyMailingList")}:{" "}
                      <Link
                        className="font-medium text-primary underline underline-offset-4"
                        href={path(
                          `/dashboard/mailing-lists/show/${batch.mailingList.id}`
                        )}
                      >
                        {batch.mailingList.name}
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={path(
                        `/dashboard/people/category/${category}?importedAt=${encodeURIComponent(batch.importedAt)}`
                      )}
                    >
                      {translate("people.import.viewBatch")}
                    </Link>
                  </Button>
                  {batch.mailingList ? (
                    <Button asChild size="sm">
                      <Link
                        href={path(
                          `/dashboard/mailing-lists/show/${batch.mailingList.id}?prepare=1#prepare-invitations`
                        )}
                      >
                        {translate("people.import.prepareInvitations")}
                        <ArrowUpRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
