"use client";

import React from "react";
import { type BaseKey, useEditButton } from "@refinedev/core";
import { Button } from "@/components/shared/ui/button";
import { useCanAction } from "@/hooks/core/use-can-action.hook";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type EditButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const EditButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  EditButtonProps
>(
  (
    { resource, recordItemId, accessControl, meta, children, onClick, className, ...rest },
    ref
  ) => {
    const { LinkComponent, to, label } = useEditButton({
      resource,
      id: recordItemId,
      accessControl: { ...accessControl, enabled: false },
      meta,
    });
    const canEdit = useCanAction(resource, "edit");
    const hideIfUnauthorized = accessControl?.hideIfUnauthorized ?? true;
    const isDisabled = Boolean(rest.disabled) || !canEdit;
    const isHidden = rest.hidden || (hideIfUnauthorized && !canEdit);

    if (isHidden) return null;

    const content = children ?? <Pencil className="size-4" />;

    if (onClick) {
      return (
        <Button
          type="button"
          size="icon"
          aria-label={label}
          className={cn("size-10 shrink-0", className)}
          {...rest}
          ref={ref}
          disabled={isDisabled}
          onClick={onClick}
        >
          {content}
        </Button>
      );
    }

    return (
      <Button
        size="icon"
        aria-label={label}
        className={cn("size-10 shrink-0", className)}
        {...rest}
        ref={ref}
        disabled={isDisabled}
        asChild
      >
        <LinkComponent to={to} replace={false}>
          {content}
        </LinkComponent>
      </Button>
    );
  }
);

EditButton.displayName = "EditButton";
