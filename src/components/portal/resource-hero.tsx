"use client";

import type { ReactNode } from "react";
import { PageBackButton } from "@/components/shared/navigation/page-back-button";

import { RESOURCE_HEROES } from "@/components/portal/portal-tone";
import { PageHeader } from "@/components/shared/refine-ui/layout/page-header";
import { cn } from "@/lib/utils";

type ResourceHeroStat = {
  label: string;
  value: string | number;
  accent?: "glass" | "ivory" | "gold";
};

const STAT_ACCENTS = {
  glass: {
    card: "bg-white/12",
    label: "text-white/70",
    value: "text-white",
  },
  ivory: {
    card: "bg-white shadow-[0_8px_20px_rgba(24,35,86,0.18)]",
    label: "text-[#466d6b]",
    value: "text-[#182356]",
  },
  gold: {
    card: "bg-[#f59f21] shadow-[0_8px_20px_rgba(24,35,86,0.18)]",
    label: "text-[#182356]/70",
    value: "text-[#182356]",
  },
} as const;

export function ResourceHero({
  resource,
  title,
  actions,
  stats,
  ornament,
  showBack = false,
  className,
}: {
  resource?: string;
  title: string;
  actions?: ReactNode;
  stats?: ResourceHeroStat[];
  ornament?: ReactNode;
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
      <div className="relative z-10 flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {showBack ? (
              <PageBackButton className="-ml-1.5 text-white hover:bg-white/15 hover:text-white" />
            ) : null}
            <h1 className="truncate font-serif text-xl tracking-tight sm:text-2xl md:text-3xl">
              {title}
            </h1>
            {ornament}
          </div>
          {actions ? (
            <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:justify-end [&_[data-slot=button]]:h-12 [&_[data-slot=button]]:min-w-0 [&_[data-slot=button]]:shrink-0 [&_[data-slot=button]]:border-white/40 [&_[data-slot=button]]:bg-white [&_[data-slot=button]]:px-4 [&_[data-slot=button]]:text-primary [&_[data-slot=button]]:shadow-none [&_[data-slot=button]]:hover:bg-white/90 md:[&_[data-slot=button]]:h-10 [&_[data-hero-group]]:shrink-0 [&_[data-hero-group]_[data-slot=button]]:rounded-none [&_[data-hero-group]_[data-slot=button]]:border-0 [&_[data-hero-group]_[data-slot=button]]:bg-transparent [&_[data-hero-group]_[data-slot=button]]:hover:bg-primary/5">
              {actions}
            </div>
          ) : null}
        </div>
        {stats?.length ? (
          <div className="grid max-w-md grid-cols-2 gap-2 sm:gap-3">
            {stats.map((stat) => {
              const accent = STAT_ACCENTS[stat.accent ?? "glass"];
              return (
                <div
                  key={stat.label}
                  className={cn("min-w-0 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3", accent.card)}
                >
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs",
                      accent.label
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-lg font-bold tabular-nums tracking-tight sm:text-2xl",
                      accent.value
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
