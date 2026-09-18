"use client";

import type { ReactNode } from "react";
import { useLink } from "@refinedev/core";

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
      <span className={cn("absolute inset-y-0 left-0 w-1.5", palette.rail)} />
      {icon ? (
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
            palette.wrap
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <span className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
        {meta ? (
          <span
            className={cn(
              "pt-1 text-xs font-medium uppercase tracking-wide",
              palette.meta
            )}
          >
            {meta}
          </span>
        ) : null}
      </span>
    </>
  );

  const className = cn(
    "relative flex items-start gap-4 overflow-hidden p-5 pl-6",
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
