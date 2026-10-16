"use client";

import { useState, type ReactNode } from "react";
import { useTranslate } from "@refinedev/core";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";

type DeleteConfirmPopoverProps = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmPopover({
  title,
  description,
  confirmLabel,
  cancelLabel,
  disabled,
  children,
  onConfirm,
}: DeleteConfirmPopoverProps) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function runConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        if (busy || disabled) {
          return;
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="z-[100] w-72 space-y-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {title ?? translate("buttons.confirm")}
          </p>
          <p className="text-sm text-muted-foreground">
            {description ?? translate("buttons.confirmDeleteDescription")}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            {cancelLabel ?? translate("buttons.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={() => void runConfirm()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel ?? translate("buttons.delete")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
