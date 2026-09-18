"use client";

import type { ReactNode } from "react";
import { PageBackButton } from "@/components/shared/navigation/page-back-button";

import { RESOURCE_HEROES } from "@/components/portal/portal-tone";
import { PageHeader } from "@/components/shared/refine-ui/layout/page-header";
import { cn } from "@/lib/utils";

export function ResourceHero({
  resource,
  title,
  actions,
  showBack = false,
  className,
}: {
  resource?: string;
  title: string;
  actions?: ReactNode;
  showBack?: boolean;
  className?: string;
}) {
  const palette = resource ? RESOURCE_HEROES[resource] : undefined;

  if (!palette) {
    return (
      <PageHeader
        title={title}
        actions={actions}
        showBack={showBack}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 text-white shadow-[0_12px_32px_rgba(24,35,86,0.22)] sm:p-5 md:p-6",
        palette.hero,
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-10 -right-8 size-36 rounded-full blur-2xl",
          palette.glow
        )}
      />
      <div className="relative z-10 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-1">
          {showBack ? (
            <PageBackButton className="-ml-1.5 text-white hover:bg-white/15 hover:text-white" />
          ) : null}
          <h1 className="truncate font-serif text-xl tracking-tight sm:text-2xl md:text-3xl">
            {title}
          </h1>
        </div>
        {actions ? (
          <div className="relative z-10 flex w-full min-w-0 shrink-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:shrink-0 [&_[data-slot=button]]:border-white/40 [&_[data-slot=button]]:bg-white [&_[data-slot=button]]:text-primary [&_[data-slot=button]]:shadow-none [&_[data-slot=button]]:hover:bg-white/90 [&_[data-hero-group]]:shrink-0 [&_[data-hero-group]_[data-slot=button]]:rounded-none [&_[data-hero-group]_[data-slot=button]]:border-0 [&_[data-hero-group]_[data-slot=button]]:bg-transparent [&_[data-hero-group]_[data-slot=button]]:hover:bg-primary/5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
