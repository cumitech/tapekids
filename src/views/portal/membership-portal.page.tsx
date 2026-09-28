"use client";

import { useTranslate } from "@refinedev/core";

import { MembershipCard } from "@/components/portal/membership-card";
import { PortalEmpty, PortalLoading } from "@/components/portal/portal-empty";
import { PortalHero } from "@/components/portal/portal-hero";
import { PORTAL_TONES, type PortalTone } from "@/components/portal/portal-tone";
import { SponsorPayForm } from "@/components/sponsors/sponsor-pay-form";
import { PaymentList } from "@/components/payments/payment-list";
import { Button } from "@/components/shared/ui/button";
import {
  MEMBERSHIP_STATUSES,
  PAYMENT_STATUSES,
  type EventMembershipKind,
} from "@/constants/event-participation";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useMe } from "@/hooks/core/use-me.hook";
import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { cn } from "@/lib/utils";

type MembershipPortalPageProps = {
  titleKey: string;
  descriptionKey: string;
  emptyTitleKey: string;
  emptyDescriptionKey: string;
  eyebrowKey: string;
  kinds: readonly EventMembershipKind[];
  redirectPath: string;
  tone: PortalTone;
  showSponsorCta?: boolean;
};

export function MembershipPortalPage({
  titleKey,
  descriptionKey,
  emptyTitleKey,
  emptyDescriptionKey,
  eyebrowKey,
  kinds,
  redirectPath,
  tone,
  showSponsorCta = false,
}: MembershipPortalPageProps) {
  const translate = useTranslate();
  const { isAdmin } = useRoleFlags();
  const { openCreate } = useDashboardFormModal();
  const { profile, loading, reload, profileComplete } = useMe();
  const memberships =
    profile?.memberships.filter((membership) => kinds.includes(membership.kind)) ??
    [];
  const dueCount = memberships.filter(
    (membership) =>
      membership.dueAmount > 0 &&
      membership.payment?.status !== PAYMENT_STATUSES.PAID &&
      membership.payment?.status !== PAYMENT_STATUSES.WAIVED
  ).length;
  const registeredCount = memberships.filter(
    (membership) => membership.status === MEMBERSHIP_STATUSES.REGISTERED
  ).length;
  const Icon = PORTAL_TONES[tone].Icon;
  const canSponsor = showSponsorCta && !isAdmin && Boolean(profile);

  const openSponsor = () => {
    if (!profile) {
      return;
    }
    openCreate(
      "sponsors",
      ({ close }) => (
        <SponsorPayForm
          accountName={profile.user.name}
          fullName={profile.person?.fullName || profile.user.name}
          email={profile.person?.email || profile.user.email}
          defaultPhone={profile.person?.phone}
          onCancel={close}
          onSuccess={() => void reload()}
        />
      ),
      "sm:max-w-md"
    );
  };

  const sponsorButton = () =>
    canSponsor ? (
      <Button
        type="button"
        size="lg"
        className="bg-warning text-warning-foreground shadow-[0_8px_20px_rgba(245,159,33,0.35)] hover:bg-[#ffb03a]"
        onClick={openSponsor}
      >
        {translate("sponsorships.sponsorCta")}
      </Button>
    ) : null;

  return (
    <section className="flex flex-col gap-8">
      <PortalHero
        tone={tone}
        eyebrow={translate(eyebrowKey)}
        title={translate(titleKey)}
        description={translate(descriptionKey)}
        showBack
        actions={sponsorButton()}
        stats={[
          {
            label: translate("portal.statEvents"),
            value: memberships.length,
          },
          {
            label: translate("portal.statDue"),
            value: dueCount,
          },
          {
            label: translate("portal.statRegistered"),
            value: registeredCount,
          },
        ]}
      />
      {loading ? (
        <PortalLoading />
      ) : memberships.length === 0 ? (
        <PortalEmpty
          icon={Icon}
          title={translate(emptyTitleKey)}
          description={translate(emptyDescriptionKey)}
          action={sponsorButton()}
        />
      ) : (
        <div className="grid gap-5">
          {memberships.map((membership) => (
            <MembershipCard
              key={membership.id}
              membership={membership}
              personId={profile?.user.personId || profile?.person?.id || ""}
              accountName={profile?.user.name}
              defaultPhone={profile?.person?.phone}
              redirectPath={redirectPath}
              profileComplete={profileComplete}
              onPaid={() => void reload()}
            />
          ))}
        </div>
      )}
      {profile?.user.personId ? (
        <div className={cn(PORTAL_SURFACE, "p-5 md:p-6")}>
          <PaymentList source="self" personId={profile.user.personId} />
        </div>
      ) : null}
    </section>
  );
}
