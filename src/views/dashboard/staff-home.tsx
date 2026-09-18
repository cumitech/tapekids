"use client";

import { CalendarDays, Mail, UserPlus, Users } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import Link from "next/link";

import { PortalCard } from "@/components/portal/portal-card";
import { PortalHero } from "@/components/portal/portal-hero";
import { Button } from "@/components/shared/ui/button";
import { useResourceTotal } from "@/hooks/dashboard/use-resource-total.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";

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
    <section className="flex flex-col gap-8">
      <PortalHero
        tone="staff"
        eyebrow={translate("dashboard.staffEyebrow")}
        title={translate("dashboard.staffTitle")}
        description={translate("dashboard.staffDescription")}
        stats={[
          { label: translate("people.titles.list"), value: people },
          { label: translate("mailingLists.titles.list"), value: lists },
          { label: translate("events.titles.list"), value: events },
        ]}
        actions={
          <Button
            asChild
            className="bg-white text-primary hover:bg-[#e1edef]"
          >
            <Link href={path("/dashboard/people")}>
              <UserPlus className="size-4" />
              {translate("dashboard.staffAddPerson")}
            </Link>
          </Button>
        }
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
