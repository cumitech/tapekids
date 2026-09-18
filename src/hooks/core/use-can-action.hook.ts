"use client";

import { useResourceParams } from "@refinedev/core";

import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import {
  canPerform,
  type PermissionAction,
} from "@/lib/permissions";

export function useCanAction(
  resource: string | undefined,
  action: PermissionAction
) {
  const { resource: inferred } = useResourceParams();
  const { roles } = useSessionRoles();
  return canPerform({
    roles,
    resource: resource || inferred?.name || "",
    action,
  });
}
