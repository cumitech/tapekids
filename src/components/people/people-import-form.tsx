"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { FileSpreadsheet } from "lucide-react";

import { PersonCategorySelect } from "@/components/people/person-category-select";
import { RequiredMark } from "@/components/shared/form/required-mark";
import { Button } from "@/components/shared/ui/button";
import { Label } from "@/components/shared/ui/label";
import { cn } from "@/lib/utils";
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
  lockedCategory?: PersonCategory;
  onImported?: (result: PeopleImportResult) => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
};

export function PeopleImportForm({
  lockedCategory,
  onImported,
  onCancel,
  onBusyChange,
}: PeopleImportFormProps) {
  const translate = useTranslate();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<PersonCategory | "">(lockedCategory ?? "");
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
    const chosen = lockedCategory || category;
    if (!chosen || !file) {
      setError(translate("people.import.missing"));
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("category", chosen);
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
        <PersonCategorySelect
          value={lockedCategory || category}
          onChange={setCategory}
          disabled={Boolean(lockedCategory)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fileInputId}>
          {translate("people.import.file")}
          <RequiredMark required />
        </Label>
        <div
          className={cn(
            "border-input bg-transparent flex h-12 w-full min-w-0 items-center gap-2 rounded-md border px-1.5 shadow-xs md:h-9",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
          )}
        >
          <FileSpreadsheet className="ml-1.5 size-4 shrink-0 text-muted-foreground" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              file ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {file ? file.name : translate("people.import.emptyFile")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            className="h-9 shrink-0 px-3 md:h-7"
            onClick={() => fileInputRef.current?.click()}
          >
            {translate("people.import.browse")}
          </Button>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            disabled={busy}
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
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
