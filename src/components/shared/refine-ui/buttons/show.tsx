"use client";

import React from "react";
import { type BaseKey, useShowButton } from "@refinedev/core";
import { Eye } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useCanAction } from "@/hooks/core/use-can-action.hook";

type ShowButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const ShowButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ShowButtonProps
>(
  (
    { resource, recordItemId, accessControl, meta, children, onClick, ...rest },
    ref
  ) => {
    const { LinkComponent, to, label } = useShowButton({
      resource,
      id: recordItemId,
      accessControl: { ...accessControl, enabled: false },
      meta,
    });
    const canShow = useCanAction(resource, "show");
    const hideIfUnauthorized = accessControl?.hideIfUnauthorized ?? true;
    const isDisabled = Boolean(rest.disabled) || !canShow;
    const isHidden = rest.hidden || (hideIfUnauthorized && !canShow);

    if (isHidden) return null;

    return (
      <Button
        {...rest}
        ref={ref}
        disabled={isDisabled}
        size="icon"
        aria-label={label}
        asChild
      >
        <LinkComponent
          to={to}
          replace={false}
          onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
            if (isDisabled) {
              e.preventDefault();
              return;
            }
            if (onClick) {
              e.preventDefault();
              onClick(e);
            }
          }}
        >
          {children ?? <Eye className="h-4 w-4" />}
        </LinkComponent>
      </Button>
    );
  }
);

ShowButton.displayName = "ShowButton";
