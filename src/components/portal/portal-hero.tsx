"use client";

import type { ReactNode } from "react";

import { PageBackButton } from "@/components/shared/navigation/page-back-button";
import { PORTAL_TONES, type PortalTone } from "@/components/portal/portal-tone";
import { cn } from "@/lib/utils";

type PortalStat = {
  label: string;
  shortLabel?: string;
  value: string | number;
};

export function PortalHero({
  title,
  description,
  actions,
  tone,
  eyebrow,
  stats,
  showBack = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: PortalTone;
  eyebrow?: string;
  stats?: PortalStat[];
  showBack?: boolean;
}) {
  if (!tone) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {showBack ? (
              <PageBackButton className="text-foreground hover:bg-muted" />
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
          {description ? (
            <p className="text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    );
  }

  const palette = PORTAL_TONES[tone];
  const Icon = palette.Icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 text-white shadow-[0_12px_32px_rgba(24,35,86,0.28)] sm:p-6 md:p-8",
        palette.hero
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-10 -right-8 size-40 rounded-full blur-2xl",
          palette.glow
        )}
      />
      <span className="pointer-events-none absolute -bottom-16 left-10 hidden size-48 rounded-full bg-white/10 blur-2xl sm:block" />
      <div className="relative flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            {showBack ? (
              <PageBackButton className="mt-0.5 text-white hover:bg-white/15 hover:text-white" />
            ) : null}
            <span
              className={cn(
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12",
                palette.iconWrap
              )}
            >
              <Icon className="size-5 sm:size-6" />
            </span>
            <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-xs sm:tracking-[0.18em]">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="font-serif text-[1.65rem] leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="max-w-2xl text-[13px] leading-snug text-white/85 sm:text-sm sm:leading-relaxed md:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex w-full shrink-0 items-center sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
              {actions}
            </div>
          ) : null}
        </div>
        {stats?.length ? (
          <div
            className={cn(
              "grid gap-2 sm:gap-3",
              stats.length === 1 && "max-w-full sm:max-w-xs",
              stats.length === 2 && "grid-cols-2",
              stats.length === 3 && "grid-cols-3",
              stats.length >= 4 && "grid-cols-2 sm:grid-cols-4"
            )}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 rounded-xl bg-white/12 px-2 py-2 text-center backdrop-blur-sm sm:px-4 sm:py-3 sm:text-left"
              >
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wide text-white/70 sm:text-xs">
                  <span className="sm:hidden">{stat.shortLabel ?? stat.label}</span>
                  <span className="hidden sm:inline">{stat.label}</span>
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums sm:mt-1 sm:text-2xl">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
