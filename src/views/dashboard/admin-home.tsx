"use client";

import { cloneElement, isValidElement } from "react";
import { useTranslate } from "@refinedev/core";
import { ListChecks } from "lucide-react";

import { PortalCard } from "@/components/portal/portal-card";
import { RESOURCE_CARD_TINT } from "@/components/portal/portal-tone";
import { useRefineResources } from "@/hooks/core/refine-resources.hook";
import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { canPerform } from "@/lib/permissions";
import { DashboardOpsHero } from "@/views/dashboard/dashboard-ops-hero";

const ICON = { className: "h-4 w-4" };
const ADMIN_GROUPS = [
  {
    titleKey: "dashboard.adminNavDirectory",
    names: [
      "people",
      "waiting-list",
      "mailing-lists",
      "events",
      "sponsors",
      "payments",
    ],
  },
  {
    titleKey: "dashboard.adminNavReporting",
    names: ["reports"],
  },
  {
    titleKey: "dashboard.adminNavOversight",
    names: ["audit-logs", "app-settings"],
  },
] as const;

export function AdminHome() {
  const translate = useTranslate();
  const { roles } = useRoleFlags();
  const resources = useRefineResources().filter((resource) =>
    canPerform({ roles, resource: resource.name, action: "list" })
  );
  const groups = ADMIN_GROUPS.map((group) => ({
    title: translate(group.titleKey),
    resources: group.names.flatMap((name) => {
      const resource = resources.find((item) => item.name === name);
      return resource ? [resource] : [];
    }),
  })).filter((group) => group.resources.length > 0);

  return (
    <section className="flex flex-col gap-5 sm:gap-6">
      <DashboardOpsHero
        tone="admin"
        eyebrow={translate("dashboard.adminEyebrow")}
        title={translate("dashboard.adminTitle")}
        description={translate("dashboard.adminDescription")}
      />
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-tight text-primary dark:text-foreground">
          {translate("prepareEvent.entry")}
        </h2>
        <div className="grid items-stretch gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <PortalCard
            href="/dashboard/prepare-event"
            tint="amber"
            icon={<ListChecks className="h-4 w-4" />}
            title={translate("prepareEvent.title")}
            description={translate("prepareEvent.description")}
            meta={translate("prepareEvent.start")}
          />
        </div>
      </div>
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-tight text-primary dark:text-foreground">
            {group.title}
          </h2>
          <div className="grid items-stretch gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {group.resources.map((resource) => {
              const href =
                typeof resource.list === "string" ? resource.list : undefined;
              if (!href) {
                return null;
              }
              const icon = resource.meta?.icon;
              return (
                <PortalCard
                  key={resource.name}
                  href={href}
                  tint={RESOURCE_CARD_TINT[resource.name] ?? "navy"}
                  icon={isValidElement(icon) ? cloneElement(icon, ICON) : icon}
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
        </div>
      ))}
    </section>
  );
}
