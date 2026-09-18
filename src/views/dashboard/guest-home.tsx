"use client";

import { createElement } from "react";
import { HeartHandshake, Tent, UserRound } from "lucide-react";
import { useLink, useTranslate } from "@refinedev/core";

import { PortalCard } from "@/components/portal/portal-card";
import { PortalEmpty, PortalLoading } from "@/components/portal/portal-empty";
import { PortalHero } from "@/components/portal/portal-hero";
import { MembershipCard } from "@/components/portal/membership-card";
import { GUEST_HOME_CARDS } from "@/constants/guest-portal";
import { SPONSOR_PORTAL_KINDS } from "@/constants/event-participation";
import { useGuestHome } from "@/hooks/dashboard/use-guest-home.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";

const ICON = { className: "h-5 w-5" };
const CARD_ICONS = {
  camp: Tent,
  sponsor: HeartHandshake,
  profile: UserRound,
} as const;

export function GuestHome() {
  const translate = useTranslate();
  const Link = useLink();
  const { path } = useLocale();
  const home = useGuestHome();
  const counts = {
    camp: home.campCount,
    sponsor: home.sponsorCount,
  };

  return (
    <section className="flex flex-col gap-8">
      <PortalHero
        tone="guest"
        eyebrow={translate("dashboard.guestEyebrow")}
        title={translate("dashboard.guestTitle", { name: home.name })}
        description={translate("dashboard.guestDescription")}
        stats={[
          {
            label: translate("camp.titles.list"),
            value: home.campCount,
          },
          {
            label: translate("sponsorships.titles.list"),
            value: home.sponsorCount,
          },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUEST_HOME_CARDS.map((card) => (
          <PortalCard
            key={card.href}
            href={path(card.href)}
            tint={card.tint}
            icon={createElement(
              card.count ? CARD_ICONS[card.count] : CARD_ICONS.profile,
              ICON
            )}
            title={translate(card.labelKey)}
            description={translate(card.descriptionKey)}
            meta={
              card.count
                ? translate("portal.count", { count: counts[card.count] })
                : undefined
            }
          />
        ))}
      </div>
      {home.loading ? (
        <PortalLoading />
      ) : home.upcoming.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {translate("dashboard.upcoming")}
            </h2>
            <Link
              to={path("/dashboard/camp")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {translate("dashboard.viewAll")}
            </Link>
          </div>
          <div className="grid gap-4">
            {home.upcoming.map((membership) => (
              <MembershipCard
                key={membership.id}
                membership={membership}
                personId={home.personId}
                defaultPhone={home.defaultPhone}
                redirectPath={
                  SPONSOR_PORTAL_KINDS.includes(membership.kind)
                    ? "/dashboard/sponsorships"
                    : "/dashboard/camp"
                }
                onPaid={() => void home.reload()}
                profileComplete={home.profileComplete}
              />
            ))}
          </div>
        </div>
      ) : (
        <PortalEmpty
          title={translate("dashboard.noMembershipsTitle")}
          description={translate("dashboard.noMembershipsDescription")}
        />
      )}
    </section>
  );
}
