"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function CategoryToggle({
  open,
  label,
  onToggle,
}: {
  open: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 md:size-8"
      aria-expanded={open}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onToggle();
      }}
    >
      <ChevronRight
        className={cn("size-4 transition-transform", open && "rotate-90")}
      />
    </button>
  );
}
