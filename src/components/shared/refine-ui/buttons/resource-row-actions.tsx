"use client";

import { DeleteButton } from "@/components/shared/refine-ui/buttons/delete";
import { EditButton } from "@/components/shared/refine-ui/buttons/edit";
import { ShowButton } from "@/components/shared/refine-ui/buttons/show";

type ResourceRowActionsProps = {
  id: string;
  onEdit?: () => void;
};

export function ResourceRowActions({ id, onEdit }: ResourceRowActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <ShowButton
        recordItemId={id}
        size="icon"
        variant="outline"
        className="size-11 md:size-8"
      />
      <EditButton
        recordItemId={id}
        size="icon"
        className="size-11 md:size-8"
        onClick={onEdit}
      />
      <DeleteButton recordItemId={id} size="icon" className="size-11 md:size-8" />
    </div>
  );
}
