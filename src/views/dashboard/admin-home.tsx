"use client";

import { cloneElement, isValidElement } from "react";
import { useTranslate } from "@refinedev/core";

import { PortalCard } from "@/components/portal/portal-card";
import { PortalHero } from "@/components/portal/portal-hero";
import { RESOURCE_CARD_TINT } from "@/components/portal/portal-tone";
import { USER_ROLES } from "@/constants/user-roles";
import { useRefineResources } from "@/hooks/core/refine-resources.hook";
import { useResourceTotal } from "@/hooks/dashboard/use-resource-total.hook";
import { canPerform } from "@/lib/permissions";
import { DashboardAddPersonAction } from "@/views/dashboard/dashboard-hero-actions";
import { directoryHeroStats } from "@/views/dashboard/dashboard-hero-stats";

const ICON = { className: "h-5 w-5" };
const ADMIN_SECTIONS = ["people", "mailing-lists", "events", "audit-logs"];

export function AdminHome() {
  const translate = useTranslate();
  const roles = [USER_ROLES.ADMIN];
  const resources = useRefineResources().filter(
    (resource) =>
      ADMIN_SECTIONS.includes(resource.name) &&
      canPerform({ roles, resource: resource.name, action: "list" })
  );
  const people = useResourceTotal("people");
  const lists = useResourceTotal("mailing-lists");
  const events = useResourceTotal("events");
  const audits = useResourceTotal("audit-logs");

  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <PortalHero
        tone="admin"
        eyebrow={translate("dashboard.adminEyebrow")}
        title={translate("dashboard.adminTitle")}
        description={translate("dashboard.adminDescription")}
        stats={[
          ...directoryHeroStats(translate, { people, lists, events }),
          {
            label: translate("auditLogs.titles.list"),
            shortLabel: translate("dashboard.statAudit"),
            value: audits,
          },
        ]}
        actions={<DashboardAddPersonAction />}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => {
          const href =
            typeof resource.list === "string" ? resource.list : undefined;
          if (!href) {
            return null;
          }
          return (
            <PortalCard
              key={resource.name}
              href={href}
              tint={RESOURCE_CARD_TINT[resource.name] ?? "navy"}
              icon={
                isValidElement(resource.meta?.icon)
                  ? cloneElement(resource.meta.icon, ICON)
                  : resource.meta?.icon
              }
              title={translate(
                String(resource.meta?.label ?? resource.name),
                String(resource.meta?.label ?? resource.name)
              )}
              description={translate(`dashboard.sections.${resource.name}`)}
              meta={translate("dashboard.openSection")}
            />
          );
        })}
      </div>
    </section>
  );
}
