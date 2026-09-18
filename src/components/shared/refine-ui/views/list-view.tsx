"use client";

import type { PropsWithChildren } from "react";

import { useResourceParams } from "@refinedev/core";

import { ResourceHero } from "@/components/portal/resource-hero";
import { CreateButton } from "@/components/shared/refine-ui/buttons/create";
import { useCanAction } from "@/hooks/core/use-can-action.hook";
import { useResourceViewTitle } from "@/hooks/core/use-resource-labels.hook";
import { cn } from "@/lib/utils";

type ListViewProps = PropsWithChildren<{
  className?: string;
}>;

export function ListView({ children, className }: ListViewProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>{children}</div>
  );
}

type ListHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  canCreate?: boolean;
  headerClassName?: string;
  wrapperClassName?: string;
  onCreate?: () => void;
}>;

export const ListViewHeader = ({
  canCreate,
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  onCreate,
}: ListHeaderProps) => {
  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const resourceName = resourceFromProps ?? resource?.name ?? identifier;
  const translatedTitle = useResourceViewTitle("list", resourceFromProps);
  const canCreateResource = useCanAction(resourceName, "create");
  const isCreateButtonVisible =
    canCreate !== undefined
      ? canCreate
      : canCreateResource && Boolean(onCreate || resource?.create);
  const title = titleFromProps ?? translatedTitle;

  return (
    <ResourceHero
      resource={resourceName}
      title={title}
      className={wrapperClassName}
      actions={
        isCreateButtonVisible ? (
          <CreateButton resource={resourceName} onClick={onCreate} />
        ) : null
      }
    />
  );
};

ListView.displayName = "ListView";
