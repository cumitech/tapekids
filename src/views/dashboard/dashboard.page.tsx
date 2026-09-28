"use client";

import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { AdminHome } from "@/views/dashboard/admin-home";
import { GuestHome } from "@/views/dashboard/guest-home";

export function DashboardPage() {
  const { isGuest } = useRoleFlags();
  if (isGuest) {
    return <GuestHome />;
  }
  return <AdminHome />;
}
