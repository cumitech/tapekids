"use client";

import { type PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useLocale } from "@/hooks/core/use-locale.hook";
import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import {
  dashboardActionFromPath,
  dashboardResourceFromPath,
} from "@/lib/dashboard-resource";
import { canPerform } from "@/lib/permissions";

export function ResourceRouteGuard({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { path } = useLocale();
  const resource = dashboardResourceFromPath(pathname ?? "");
  const action = dashboardActionFromPath(pathname ?? "");
  const { roles } = useSessionRoles();
  const allowed =
    !resource ||
    !roles.length ||
    canPerform({ roles, resource, action });

  useEffect(() => {
    if (!resource || !roles.length) {
      return;
    }
    if (!canPerform({ roles, resource, action })) {
      router.replace(path("/dashboard"));
    }
  }, [action, resource, roles, path, router]);

  if (!allowed) {
    return null;
  }

  return children;
}
