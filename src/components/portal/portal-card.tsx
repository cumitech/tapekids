"use client";

import type { ReactNode } from "react";
import { useLink } from "@refinedev/core";
import { ArrowRight } from "lucide-react";

import {
  PORTAL_CARD_TINTS,
  type PortalCardTint,
} from "@/components/portal/portal-tone";
import { PORTAL_SURFACE, PORTAL_SURFACE_HOVER } from "@/constants/layout";
import { cn } from "@/lib/utils";

type PortalCardProps = {
  href?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  meta?: string;
  tint?: PortalCardTint;
};

export function PortalCard({
  href,
  icon,
  title,
  description,
  meta,
  tint = "navy",
}: PortalCardProps) {
  const Link = useLink();
  const palette = PORTAL_CARD_TINTS[tint];
  const body = (
    <>
      <span className={cn("absolute inset-y-2 left-0 w-0.5 rounded-r-full", palette.rail)} />
      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              palette.wrap
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 text-sm font-semibold leading-tight text-foreground">
          {title}
        </span>
      </span>
      <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
        {description}
      </span>
      {meta ? (
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
          {meta}
          <ArrowRight className="size-3" />
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "relative flex h-full flex-col gap-2 overflow-hidden px-3.5 py-3 pl-4",
    PORTAL_SURFACE,
    href && PORTAL_SURFACE_HOVER
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link to={href} className={className}>
      {body}
    </Link>
  );
}
