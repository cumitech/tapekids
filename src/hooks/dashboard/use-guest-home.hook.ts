"use client";

import { useGetIdentity } from "@refinedev/core";

import {
  CAMP_PORTAL_KINDS,
  SPONSOR_PORTAL_KINDS,
} from "@/constants/event-participation";
import { useMe } from "@/hooks/core/use-me.hook";

export function useGuestHome() {
  const { data: identity } = useGetIdentity<{ name?: string }>();
  const { profile, loading, reload, profileComplete } = useMe();
  const memberships = profile?.memberships ?? [];

  return {
    name: profile?.person?.firstName || identity?.name || "",
    campCount: memberships.filter((item) =>
      CAMP_PORTAL_KINDS.includes(item.kind)
    ).length,
    sponsorCount: memberships.filter((item) =>
      SPONSOR_PORTAL_KINDS.includes(item.kind)
    ).length,
    upcoming: memberships.slice(0, 2),
    personId: profile?.user.personId || profile?.person?.id || "",
    defaultPhone: profile?.person?.phone,
    profileComplete,
    loading,
    reload,
  };
}
