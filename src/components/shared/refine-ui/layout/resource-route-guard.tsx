"use client";

import { type PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { GUEST_PROFILE_PATH } from "@/constants/guest-portal";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMe } from "@/hooks/core/use-me.hook";
import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import {
  dashboardActionFromPath,
  dashboardResourceFromPath,
} from "@/lib/dashboard-resource";
import { canPerform, isParticipantRole } from "@/lib/permissions";
import { isGuestProfilePath } from "@/lib/people/profile-completeness";

export function ResourceRouteGuard({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { path } = useLocale();
  const resource = dashboardResourceFromPath(pathname ?? "");
  const action = dashboardActionFromPath(pathname ?? "");
  const { roles } = useSessionRoles();
  const { loading, profileComplete } = useMe();
  const onProfile = isGuestProfilePath(pathname);
  const mustCompleteProfile =
    isParticipantRole(roles) && !loading && !profileComplete && !onProfile;
  const allowed =
    !resource ||
    (roles.length > 0 && canPerform({ roles, resource, action }));

  useEffect(() => {
    if (!resource || !roles.length) {
      return;
    }
    if (!canPerform({ roles, resource, action })) {
      router.replace(path("/dashboard"));
      return;
    }
    if (mustCompleteProfile) {
      router.replace(path(GUEST_PROFILE_PATH));
    }
  }, [action, mustCompleteProfile, resource, roles, path, router]);

  if (!allowed || mustCompleteProfile) {
    return null;
  }

  return children;
}
