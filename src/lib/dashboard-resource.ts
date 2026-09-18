import { stripLocalePrefix } from "@/lib/locale";
import type { PermissionAction } from "@/lib/permissions";

function dashboardSegments(pathname: string) {
  return stripLocalePrefix(pathname).split("/").filter(Boolean);
}

export function dashboardResourceFromPath(pathname: string) {
  const segments = dashboardSegments(pathname);
  if (segments[0] !== "dashboard") {
    return "";
  }
  return segments[1] ?? "dashboard";
}

export function dashboardActionFromPath(pathname: string): PermissionAction {
  const segments = dashboardSegments(pathname);
  const verb = segments[2];
  if (verb === "create") {
    return "create";
  }
  if (verb === "edit") {
    return "edit";
  }
  if (verb === "show") {
    return "show";
  }
  return "list";
}
