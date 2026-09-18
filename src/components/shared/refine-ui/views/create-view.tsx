"use client";

import type { PropsWithChildren } from "react";

import { useResourceParams } from "@refinedev/core";

import { ResourceHero } from "@/components/portal/resource-hero";
import { useResourceViewTitle } from "@/hooks/core/use-resource-labels.hook";
import { cn } from "@/lib/utils";

type CreateViewProps = PropsWithChildren<{
  className?: string;
}>;

export function CreateView({ children, className }: CreateViewProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>{children}</div>
  );
}

type CreateHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
}>;

export const CreateViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
}: CreateHeaderProps) => {
  const { identifier, resource } = useResourceParams({
    resource: resourceFromProps,
  });
  const translatedTitle = useResourceViewTitle("create", resourceFromProps);
  const title = titleFromProps ?? translatedTitle;

  return (
    <ResourceHero
      resource={resourceFromProps ?? identifier ?? resource?.name}
      title={title}
      showBack
      className={wrapperClassName}
    />
  );
};

CreateView.displayName = "CreateView";
