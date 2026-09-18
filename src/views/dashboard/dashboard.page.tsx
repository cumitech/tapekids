"use client";

import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import { hasRole, USER_ROLES } from "@/constants/user-roles";
import { isParticipantRole } from "@/lib/permissions";
import { AdminHome } from "@/views/dashboard/admin-home";
import { GuestHome } from "@/views/dashboard/guest-home";
import { StaffHome } from "@/views/dashboard/staff-home";

export function DashboardPage() {
  const { roles } = useSessionRoles();
  if (isParticipantRole(roles)) {
    return <GuestHome />;
  }
  if (hasRole(roles, USER_ROLES.ADMIN)) {
    return <AdminHome />;
  }
  return <StaffHome />;
}
