"use client";

import { useTranslate } from "@refinedev/core";

import { MembershipCard } from "@/components/portal/membership-card";
import { PortalEmpty, PortalLoading } from "@/components/portal/portal-empty";
import { PortalHero } from "@/components/portal/portal-hero";
import { PORTAL_TONES, type PortalTone } from "@/components/portal/portal-tone";
import { PaymentList } from "@/components/payments/payment-list";
import {
  MEMBERSHIP_STATUSES,
  PAYMENT_STATUSES,
  type EventMembershipKind,
} from "@/constants/event-participation";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useMe } from "@/hooks/core/use-me.hook";
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
}: MembershipPortalPageProps) {
  const translate = useTranslate();
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

  return (
    <section className="flex flex-col gap-8">
      <PortalHero
        tone={tone}
        eyebrow={translate(eyebrowKey)}
        title={translate(titleKey)}
        description={translate(descriptionKey)}
        showBack
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
        />
      ) : (
        <div className="grid gap-5">
          {memberships.map((membership) => (
            <MembershipCard
              key={membership.id}
              membership={membership}
              personId={profile?.user.personId || profile?.person?.id || ""}
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
