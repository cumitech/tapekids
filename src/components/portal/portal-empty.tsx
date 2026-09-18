"use client";

import type { LucideIcon } from "lucide-react";

import { PORTAL_SURFACE } from "@/constants/layout";
import { cn } from "@/lib/utils";

export function PortalEmpty({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cn(
        PORTAL_SURFACE,
        "bg-gradient-to-b from-accent/80 to-background px-6 py-14 text-center"
      )}
    >
      {Icon ? (
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-7" />
        </span>
      ) : null}
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function PortalLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-40 animate-pulse rounded-2xl bg-gradient-to-r from-secondary via-accent to-secondary" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
