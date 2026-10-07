"use client";

import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form/form-field";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Input } from "@/components/shared/ui/input";
import { apiErrorMessage, apiPost } from "@/lib/client/api";
import { normalizeYfId } from "@/lib/people/yf-id";

type AssignYfIdButtonProps = {
  personId: string;
  fullName?: string | null;
  yfId?: string | null;
  onSaved?: () => void;
};

export function AssignYfIdButton({
  personId,
  fullName,
  yfId,
  onSaved,
}: AssignYfIdButtonProps) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(yfId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openDialog() {
    setValue(yfId ?? "");
    setError("");
    setOpen(true);
  }

  async function save() {
    const next = normalizeYfId(value);
    if (!next) {
      setError(translate("people.assignYfId.required"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await apiPost<{ acceptedCount: number }>(
        `/people/${personId}/yf-id`,
        { yfId: next }
      );
      setOpen(false);
      toast.success(
        result.acceptedCount > 0
          ? translate("people.assignYfId.accepted", {
              count: result.acceptedCount,
            })
          : translate("people.assignYfId.saved")
      );
      onSaved?.();
    } catch (err) {
      setError(apiErrorMessage(err, translate("people.assignYfId.failed")));
    } finally {
      setBusy(false);
    }
  }

  const name = fullName?.trim() || translate("people.titles.show");

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={openDialog}>
        {translate("people.assignYfId.action")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!busy) {
            setOpen(next);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("people.assignYfId.title")}</DialogTitle>
            <DialogDescription>
              {translate("people.assignYfId.hint", { name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <FormField label={translate("people.fields.yfId")} error={error}>
              <Input
                value={value}
                autoComplete="off"
                onChange={(event) => setValue(event.target.value)}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                {translate("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {translate("buttons.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
