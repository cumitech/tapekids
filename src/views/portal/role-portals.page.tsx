"use client";

import {
  CAMP_PORTAL_KINDS,
  SPONSOR_PORTAL_KINDS,
} from "@/constants/event-participation";
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

export function SponsorshipsPage() {
  return (
    <MembershipPortalPage
      tone="sponsor"
      titleKey="sponsorships.titles.list"
      descriptionKey="sponsorships.description"
      emptyTitleKey="sponsorships.emptyTitle"
      emptyDescriptionKey="sponsorships.emptyDescription"
      eyebrowKey="sponsorships.eyebrow"
      kinds={SPONSOR_PORTAL_KINDS}
      redirectPath="/dashboard/sponsorships"
    />
  );
}
