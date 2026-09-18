"use client";

import React from "react";
import { type BaseKey, useDeleteButton } from "@refinedev/core";
import { Loader2, Trash } from "lucide-react";

import { useAppModal } from "@/components/shared/modals/app-modal";
import { Button } from "@/components/shared/ui/button";
import { useCanAction } from "@/hooks/core/use-can-action.hook";

type DeleteButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const DeleteButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  DeleteButtonProps
>(({ resource, recordItemId, accessControl, meta, children, ...rest }, ref) => {
  const { confirm } = useAppModal();
  const {
    loading,
    onConfirm,
    label,
    confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
  } = useDeleteButton({
    resource,
    id: recordItemId,
    accessControl: { ...accessControl, enabled: false },
    meta,
  });
  const canDelete = useCanAction(resource, "delete");
  const hideIfUnauthorized = accessControl?.hideIfUnauthorized ?? true;
  const isDisabled = Boolean(rest.disabled) || loading || !canDelete;
  const isHidden = rest.hidden || (hideIfUnauthorized && !canDelete);

  if (isHidden) return null;

  return (
    <Button
      variant="destructive"
      type="button"
      size="icon"
      aria-label={label}
      {...rest}
      ref={ref}
      disabled={isDisabled}
      onClick={() =>
        confirm({
          title: defaultConfirmTitle,
          confirmLabel: defaultConfirmOkLabel,
          cancelLabel: defaultCancelLabel,
          destructive: true,
          onConfirm: () => {
            onConfirm?.();
          },
        })
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children ?? <Trash className="h-4 w-4" />
      )}
    </Button>
  );
});

DeleteButton.displayName = "DeleteButton";
