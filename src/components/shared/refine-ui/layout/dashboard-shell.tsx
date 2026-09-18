"use client";

import type { PropsWithChildren } from "react";
import { Authenticated } from "@refinedev/core";

import { GuestPortalLayout } from "@/components/shared/refine-ui/layout/guest-portal-layout";
import { Layout } from "@/components/shared/refine-ui/layout/layout";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMounted } from "@/hooks/core/use-mounted.hook";
import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import { isParticipantRole } from "@/lib/permissions";

function DashboardChrome({ children }: PropsWithChildren) {
  const { roles } = useSessionRoles();

  if (isParticipantRole(roles)) {
    return <GuestPortalLayout>{children}</GuestPortalLayout>;
  }

  return <Layout>{children}</Layout>;
}

export function DashboardShell({ children }: PropsWithChildren) {
  const { path } = useLocale();
  const ready = useMounted();

  if (!ready) {
    return <div className="min-h-svh bg-muted/40" />;
  }

  return (
    <Authenticated
      key="dashboard"
      redirectOnFail={path("/login")}
      loading={<div className="min-h-svh bg-muted/40" />}
    >
      <DashboardChrome>{children}</DashboardChrome>
    </Authenticated>
  );
}
