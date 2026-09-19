"use client";

import { CalendarDays, Mail, Users } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { PortalCard } from "@/components/portal/portal-card";
import { PortalHero } from "@/components/portal/portal-hero";
import { useResourceTotal } from "@/hooks/dashboard/use-resource-total.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { DashboardAddPersonAction } from "@/views/dashboard/dashboard-hero-actions";
import { directoryHeroStats } from "@/views/dashboard/dashboard-hero-stats";

const ICON = { className: "h-5 w-5" };

const LINKS = [
  {
    href: "/dashboard/people",
    icon: Users,
    titleKey: "people.titles.list",
    bodyKey: "dashboard.sections.people",
    tint: "sage" as const,
  },
  {
    href: "/dashboard/mailing-lists",
    icon: Mail,
    titleKey: "mailingLists.titles.list",
    bodyKey: "dashboard.sections.mailing-lists",
    tint: "amber" as const,
  },
  {
    href: "/dashboard/events",
    icon: CalendarDays,
    titleKey: "events.titles.list",
    bodyKey: "dashboard.sections.events",
    tint: "navy" as const,
  },
];

export function StaffHome() {
  const translate = useTranslate();
  const { path } = useLocale();
  const people = useResourceTotal("people");
  const lists = useResourceTotal("mailing-lists");
  const events = useResourceTotal("events");

  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <PortalHero
        tone="staff"
        eyebrow={translate("dashboard.staffEyebrow")}
        title={translate("dashboard.staffTitle")}
        description={translate("dashboard.staffDescription")}
        stats={directoryHeroStats(translate, { people, lists, events })}
        actions={<DashboardAddPersonAction />}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <PortalCard
              key={link.href}
              href={path(link.href)}
              tint={link.tint}
              icon={<Icon className={ICON.className} />}
              title={translate(link.titleKey)}
              description={translate(link.bodyKey)}
              meta={translate("dashboard.openSection")}
            />
          );
        })}
      </div>
    </section>
  );
}
