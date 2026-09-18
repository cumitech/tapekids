"use client";

import type { PropsWithChildren } from "react";

import { useResourceParams } from "@refinedev/core";

import { ResourceHero } from "@/components/portal/resource-hero";
import { HeroActionGroup } from "@/components/shared/refine-ui/buttons/hero-action-group";
import { EditButton } from "@/components/shared/refine-ui/buttons/edit";
import { RefreshButton } from "@/components/shared/refine-ui/buttons/refresh";
import { useResourceViewTitle } from "@/hooks/core/use-resource-labels.hook";
import { cn } from "@/lib/utils";

type ShowViewProps = PropsWithChildren<{
  className?: string;
}>;

export function ShowView({ children, className }: ShowViewProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>{children}</div>
  );
}

type ShowViewHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
  onEdit?: () => void;
}>;

export const ShowViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  onEdit,
}: ShowViewHeaderProps) => {
  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const { id: recordItemId } = useResourceParams();
  const resourceName = resource?.name ?? identifier;
  const translatedTitle = useResourceViewTitle("show", resourceFromProps);
  const title = titleFromProps ?? translatedTitle;

  return (
    <ResourceHero
      resource={resourceName}
      title={title}
      showBack
      className={wrapperClassName}
      actions={
        <HeroActionGroup>
          <RefreshButton
            variant="ghost"
            className="rounded-none px-4"
            recordItemId={recordItemId}
            resource={resourceName}
          />
          <EditButton
            variant="ghost"
            className="size-10 rounded-none"
            recordItemId={recordItemId}
            resource={resourceName}
            onClick={onEdit}
          />
        </HeroActionGroup>
      }
    />
  );
};

ShowView.displayName = "ShowView";
