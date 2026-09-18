"use client";

import React from "react";
import { type BaseKey, useCreateButton, useTranslate } from "@refinedev/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useCanAction } from "@/hooks/core/use-can-action.hook";

type CreateButtonProps = {
  resource?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const CreateButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  CreateButtonProps
>(({ resource, accessControl, meta, children, onClick, ...rest }, ref) => {
  const translate = useTranslate();
  const resourceName = typeof resource === "string" ? resource : undefined;
  const { hidden, LinkComponent, to, label } = useCreateButton({
    resource,
    accessControl: { ...accessControl, enabled: false },
    meta,
  });
  const canCreate = useCanAction(resourceName, "create");
  const hideIfUnauthorized = accessControl?.hideIfUnauthorized ?? true;
  const isDisabled = Boolean(rest.disabled) || !canCreate;
  const isHidden = hidden || rest.hidden || (hideIfUnauthorized && !canCreate);

  if (isHidden) return null;

  const content = children ?? (
    <div className="flex items-center gap-2 font-semibold">
      <Plus className="h-4 w-4" />
      <span>{label ?? translate("buttons.create")}</span>
    </div>
  );

  if (onClick) {
    return (
      <Button
        type="button"
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
    <Button {...rest} ref={ref} disabled={isDisabled} asChild>
      <LinkComponent to={to} replace={false}>
        {content}
      </LinkComponent>
    </Button>
  );
});

CreateButton.displayName = "CreateButton";
