"use client";

import { useTranslate } from "@refinedev/core";
import { ClipboardList, Handshake, Trophy, UserCheck, Users } from "lucide-react";

import { PortalCard } from "@/components/portal/portal-card";
import type { PortalCardTint } from "@/components/portal/portal-tone";
import { ResourceHero } from "@/components/portal/resource-hero";
import { REPORT_KINDS } from "@/constants/reports";
import { useLocale } from "@/hooks/core/use-locale.hook";

const ICON = { className: "h-5 w-5" };

const REPORT_CARDS = [
  {
    kind: REPORT_KINDS.TROPHY_CAMPERS,
    icon: Trophy,
    tint: "sage" as PortalCardTint,
  },
  {
    kind: REPORT_KINDS.TROPHY_PARTICIPANTS,
    icon: Users,
    tint: "navy" as PortalCardTint,
  },
  {
    kind: REPORT_KINDS.CHAPERONES,
    icon: UserCheck,
    tint: "amber" as PortalCardTint,
  },
  {
    kind: REPORT_KINDS.SPONSORS,
    icon: Handshake,
    tint: "mint" as PortalCardTint,
  },
  {
    kind: REPORT_KINDS.PARTICIPANTS,
    icon: Users,
    tint: "navy" as PortalCardTint,
  },
  {
    kind: REPORT_KINDS.WAITING_LIST,
    icon: ClipboardList,
    tint: "amber" as PortalCardTint,
  },
] as const;

export function ReportsHomePage() {
  const translate = useTranslate();
  const { path } = useLocale();

  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <ResourceHero
        resource="reports"
        title={translate("reports.titles.list")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <PortalCard
              key={card.kind}
              href={path(`/dashboard/reports/${card.kind}`)}
              tint={card.tint}
              icon={<Icon className={ICON.className} />}
              title={translate(`reports.kinds.${card.kind}.title`)}
              description={translate(`reports.kinds.${card.kind}.description`)}
              meta={translate("dashboard.openSection")}
            />
          );
        })}
      </div>
    </section>
  );
}
