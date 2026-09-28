"use client";

import { useState } from "react";
import { useTranslate } from "@refinedev/core";

import { PeopleImportForm } from "@/components/people/people-import-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import type { PeopleImportResult } from "@/models/people/people-import.model";

type PeopleImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: (result: PeopleImportResult) => void;
};

export function PeopleImportDialog({
  open,
  onOpenChange,
  onImported,
}: PeopleImportDialogProps) {
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{translate("people.import.title")}</DialogTitle>
        </DialogHeader>
        {open ? (
          <PeopleImportForm
            onBusyChange={setBusy}
            onCancel={() => onOpenChange(false)}
            onImported={onImported}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
