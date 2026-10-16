"use client";

import { useTranslate } from "@refinedev/core";

import { useRefineResources } from "@/hooks/core/refine-resources.hook";
import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { canPerform } from "@/lib/permissions";

const ADMIN_GROUPS = [
  {
    titleKey: "dashboard.adminNavDirectory",
    names: [
      "people",
      "trophy",
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

export function useAdminHome() {
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

  return { translate, groups };
}
