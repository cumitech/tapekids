"use client";

import type { ReactNode } from "react";

import { DeleteButton } from "@/components/shared/refine-ui/buttons/delete";
import { EditButton } from "@/components/shared/refine-ui/buttons/edit";
import { ShowButton } from "@/components/shared/refine-ui/buttons/show";

type ResourceRowActionsProps = {
  id: string;
  resource?: string;
  onEdit?: () => void;
  children?: ReactNode;
};

export function ResourceRowActions({
  id,
  resource,
  onEdit,
  children,
}: ResourceRowActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      {children}
      <ShowButton
        resource={resource}
        recordItemId={id}
        size="icon"
        variant="outline"
        className="size-11 md:size-8"
      />
      <EditButton
        resource={resource}
        recordItemId={id}
        size="icon"
        className="size-11 md:size-8"
        onClick={onEdit}
      />
      <DeleteButton
        resource={resource}
        recordItemId={id}
        size="icon"
        className="size-11 md:size-8"
      />
    </div>
  );
}
