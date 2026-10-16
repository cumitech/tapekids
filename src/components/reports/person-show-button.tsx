"use client";

import { ShowButton } from "@/components/shared/refine-ui/buttons/show";

export function PersonShowButton({ id }: { id: string }) {
  return (
    <ShowButton
      resource="people"
      recordItemId={id}
      size="icon"
      variant="outline"
      className="size-11 md:size-8"
    />
  );
}
