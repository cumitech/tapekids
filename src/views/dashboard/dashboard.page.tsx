"use client";

import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { AdminHome } from "@/views/dashboard/admin-home";
import { GuestHome } from "@/views/dashboard/guest-home";
import { StaffHome } from "@/views/dashboard/staff-home";

export function DashboardPage() {
  const { isGuest, isAdmin } = useRoleFlags();
  if (isGuest) {
    return <GuestHome />;
  }
  if (isAdmin) {
    return <AdminHome />;
  }
  return <StaffHome />;
}
