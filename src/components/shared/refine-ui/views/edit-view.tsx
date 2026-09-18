"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { useResourceParams } from "@refinedev/core";

import { ResourceHero } from "@/components/portal/resource-hero";
import { RefreshButton } from "@/components/shared/refine-ui/buttons/refresh";
import { useResourceViewTitle } from "@/hooks/core/use-resource-labels.hook";
import { cn } from "@/lib/utils";

type EditViewProps = PropsWithChildren<{
  className?: string;
}>;

export function EditView({ children, className }: EditViewProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>{children}</div>
  );
}

type EditViewHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
  actionsSlot?: ReactNode;
}>;

export const EditViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  actionsSlot,
  wrapperClassName,
}: EditViewHeaderProps) => {
  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const { id: recordItemId } = useResourceParams();
  const resourceName = resource?.name ?? identifier;
  const translatedTitle = useResourceViewTitle("edit", resourceFromProps);
  const title = titleFromProps ?? translatedTitle;

  return (
    <ResourceHero
      resource={resourceName}
      title={title}
      showBack
      className={wrapperClassName}
      actions={
        <>
          {actionsSlot}
          <RefreshButton
            variant="outline"
            recordItemId={recordItemId}
            resource={resourceName}
          />
        </>
      }
    />
  );
};

EditView.displayName = "EditView";
