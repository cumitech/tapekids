"use client";

import { useTranslate } from "@refinedev/core";

import { PortalHero } from "@/components/portal/portal-hero";
import type { PortalTone } from "@/components/portal/portal-tone";
import { useDashboardStats } from "@/hooks/dashboard/use-dashboard-stats.hook";
import { opsHeroStats } from "@/views/dashboard/dashboard-hero-stats";

export function DashboardOpsHero({
  tone,
  eyebrow,
  title,
  description,
}: {
  tone: PortalTone;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const translate = useTranslate();
  const { stats } = useDashboardStats();

  return (
    <PortalHero
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      description={description}
      stats={opsHeroStats(translate, stats)}
    />
  );
}
