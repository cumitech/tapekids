export const GUEST_NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard.title" },
  { href: "/dashboard/camp", labelKey: "camp.titles.list" },
  { href: "/dashboard/sponsorships", labelKey: "sponsorships.titles.list" },
  { href: "/dashboard/profile", labelKey: "profile.titles.list" },
] as const;

export const GUEST_HOME_CARDS = [
  {
    href: "/dashboard/camp",
    labelKey: "camp.titles.list",
    descriptionKey: "camp.homeCard",
    tint: "amber" as const,
    count: "camp" as const,
  },
  {
    href: "/dashboard/sponsorships",
    labelKey: "sponsorships.titles.list",
    descriptionKey: "sponsorships.homeCard",
    tint: "navy" as const,
    count: "sponsor" as const,
  },
  {
    href: "/dashboard/profile",
    labelKey: "profile.titles.list",
    descriptionKey: "profile.homeCard",
    tint: "sage" as const,
    count: null,
  },
] as const;
