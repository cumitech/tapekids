"use client";

import { CAMP_PORTAL_KINDS } from "@/constants/event-participation";
import { MembershipPortalPage } from "@/views/portal/membership-portal.page";

export function CampPage() {
  return (
    <MembershipPortalPage
      tone="camp"
      titleKey="camp.titles.list"
      descriptionKey="camp.description"
      emptyTitleKey="camp.emptyTitle"
      emptyDescriptionKey="camp.emptyDescription"
      eyebrowKey="camp.eyebrow"
      kinds={CAMP_PORTAL_KINDS}
      redirectPath="/dashboard/camp"
    />
  );
}
