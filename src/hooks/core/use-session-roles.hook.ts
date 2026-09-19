"use client";

import { useGetIdentity } from "@refinedev/core";

import type { UserRole } from "@/constants/user-roles";
import {
  isAdminRole,
  isStaffDashboardRole,
  isStaffOperatorRole,
} from "@/constants/user-roles";
import { isParticipantRole, rolesFromUnknown } from "@/lib/permissions";
import { getSession } from "@/utils/auth-storage";

export function useSessionRoles() {
  const { data } = useGetIdentity<{ roles?: unknown }>();
  const roles = rolesFromUnknown(
    data?.roles ?? getSession()?.user.roles
  ) as UserRole[];
  return { roles };
}

export function useRoleFlags() {
  const { roles } = useSessionRoles();
  return {
    roles,
    isGuest: isParticipantRole(roles),
    isAdmin: isAdminRole(roles),
    isStaff: isStaffOperatorRole(roles),
    isStaffDashboard: isStaffDashboardRole(roles),
  };
}
