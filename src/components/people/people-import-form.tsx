"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";

import { PersonCategorySelect } from "@/components/people/person-category-select";
import { RequiredMark } from "@/components/shared/form/required-mark";
import { Button } from "@/components/shared/ui/button";
import { Label } from "@/components/shared/ui/label";
import type { PersonCategory } from "@/constants/person";
import {
  apiErrorMessage,
  apiUploadForm,
  isNetworkError,
  withHttpRetry,
} from "@/lib/client/api";
import { clearListQueryCache } from "@/lib/client/list-query-cache";
import type { PeopleImportResult } from "@/models/people/people-import.model";

type PeopleImportFormProps = {
  onImported?: (result: PeopleImportResult) => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
};

export function PeopleImportForm({
  onImported,
  onCancel,
  onBusyChange,
}: PeopleImportFormProps) {
  const translate = useTranslate();
  const [category, setCategory] = useState<PersonCategory | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PeopleImportResult | null>(null);
  const [error, setError] = useState("");
  const onBusyChangeRef = useRef(onBusyChange);
  onBusyChangeRef.current = onBusyChange;

  useEffect(() => {
    onBusyChangeRef.current?.(busy);
  }, [busy]);

  async function onSubmit() {
    if (!category || !file) {
      setError(translate("people.import.missing"));
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("category", category);
      body.append("file", file);
      const response = await withHttpRetry(() =>
        apiUploadForm<PeopleImportResult>("/people/import", body, {
          timeout: 120_000,
        })
      );
      clearListQueryCache("people");
      setResult(response);
      onImported?.(response);
    } catch (err) {
      setError(
        isNetworkError(err)
          ? translate("people.import.networkFailed")
          : apiErrorMessage(err, translate("people.import.failed"))
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>
          {translate("people.fields.category")}
          <RequiredMark required />
        </Label>
        <PersonCategorySelect value={category} onChange={setCategory} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>
          {translate("people.import.file")}
          <RequiredMark required />
        </Label>
        <input
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block h-12 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-base file:mr-3 file:inline-flex file:h-10 file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-sm file:font-medium file:text-primary-foreground md:h-9 md:text-sm md:file:h-7"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {translate("people.import.result", {
              created: result.created,
              updated: result.updated,
              unchanged: result.unchanged,
              skipped: result.skipped,
            })}
          </p>
          {result.errors.length ? (
            <ul className="max-h-32 overflow-auto text-sm text-destructive">
              {result.errors.map((item) => (
                <li key={`${item.row}-${item.message}`}>
                  {translate("people.import.rowError", {
                    row: item.row,
                    message: item.message,
                  })}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            {translate("buttons.cancel")}
          </Button>
        ) : null}
        <Button type="button" disabled={busy} onClick={onSubmit}>
          {busy
            ? translate("people.import.importing")
            : translate("people.import.submit")}
        </Button>
      </div>
    </div>
  );
}
