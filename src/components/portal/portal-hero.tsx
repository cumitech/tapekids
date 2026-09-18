"use client";

import type { ReactNode } from "react";

import { PageBackButton } from "@/components/shared/navigation/page-back-button";
import { PORTAL_TONES, type PortalTone } from "@/components/portal/portal-tone";
import { cn } from "@/lib/utils";

type PortalStat = {
  label: string;
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
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_12px_32px_rgba(24,35,86,0.28)] md:p-8",
        palette.hero
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-10 -right-8 size-40 rounded-full blur-2xl",
          palette.glow
        )}
      />
      <span className="pointer-events-none absolute -bottom-16 left-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {showBack ? (
              <PageBackButton className="mt-1 text-white hover:bg-white/15 hover:text-white" />
            ) : null}
            <span
              className={cn(
                "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl",
                palette.iconWrap
              )}
            >
              <Icon className="size-6" />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="font-serif text-3xl tracking-tight text-white md:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
        {stats?.length ? (
          <div
            className={cn(
              "grid gap-3",
              stats.length === 1 && "sm:max-w-xs",
              stats.length === 2 && "sm:grid-cols-2",
              stats.length >= 3 && "sm:grid-cols-3"
            )}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/12 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
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
