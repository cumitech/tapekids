"use client";

import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form/form-field";
import { ModalActions, useAppModal } from "@/components/shared/modals/app-modal";
import { Button } from "@/components/shared/ui/button";
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
  const { openModal, closeModal } = useAppModal();
  const name = fullName?.trim() || translate("people.titles.show");

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        openModal({
          title: translate("people.assignYfId.title"),
          description: translate("people.assignYfId.hint", { name }),
          body: (
            <AssignYfIdForm
              personId={personId}
              yfId={yfId}
              onClose={closeModal}
              onSaved={onSaved}
            />
          ),
        })
      }
    >
      {translate("people.assignYfId.action")}
    </Button>
  );
}

function AssignYfIdForm({
  personId,
  yfId,
  onClose,
  onSaved,
}: {
  personId: string;
  yfId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const translate = useTranslate();
  const [value, setValue] = useState(yfId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      onClose();
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

  return (
    <div className="flex flex-col gap-4">
      <FormField label={translate("people.fields.yfId")} error={error}>
        <Input
          value={value}
          autoComplete="off"
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
      <ModalActions className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
          {translate("buttons.cancel")}
        </Button>
        <Button type="button" disabled={busy} onClick={() => void save()}>
          {translate("buttons.save")}
        </Button>
      </ModalActions>
    </div>
  );
}
