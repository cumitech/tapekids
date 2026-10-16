"use client";

import { SPONSOR_PORTAL_KINDS } from "@/constants/event-participation";
import { MembershipPortalPage } from "@/views/portal/membership-portal.page";

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
      showSponsorCta
    />
  );
}
