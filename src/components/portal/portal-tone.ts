import {
  HeartHandshake,
  Shield,
  Sparkles,
  Tent,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type PortalTone = "camp" | "sponsor" | "admin" | "guest" | "profile";

export const PORTAL_TONES: Record<
  PortalTone,
  {
    hero: string;
    glow: string;
    iconWrap: string;
    Icon: LucideIcon;
  }
> = {
  camp: {
    hero: "bg-gradient-to-br from-[#182356] via-[#24356e] to-[#466d6b]",
    glow: "bg-warning/45",
    iconWrap: "bg-white/15 text-white",
    Icon: Tent,
  },
  sponsor: {
    hero: "bg-gradient-to-br from-[#182356] via-[#466d6b] to-[#3d4a8f]",
    glow: "bg-chart-4/45",
    iconWrap: "bg-white/15 text-white",
    Icon: HeartHandshake,
  },
  admin: {
    hero: "bg-gradient-to-br from-[#182356] via-[#3d4a8f] to-[#466d6b]",
    glow: "bg-warning/35",
    iconWrap: "bg-white/15 text-white",
    Icon: Shield,
  },
  guest: {
    hero: "bg-gradient-to-br from-[#182356] via-[#466d6b] to-[#f59f21]",
    glow: "bg-warning/50",
    iconWrap: "bg-white/15 text-white",
    Icon: Sparkles,
  },
  profile: {
    hero: "bg-gradient-to-br from-[#466d6b] via-[#24356e] to-[#182356]",
    glow: "bg-chart-4/40",
    iconWrap: "bg-white/15 text-white",
    Icon: UserRound,
  },
};

export const MEMBERSHIP_KIND_ACCENT: Record<string, string> = {
  camper: "bg-warning",
  coordinator: "bg-secondary",
  sponsor: "bg-primary",
};

export const MEMBERSHIP_KIND_SOFT: Record<string, string> = {
  camper: "bg-warning/18 text-foreground",
  coordinator: "bg-secondary/15 text-secondary",
  sponsor: "bg-primary/12 text-primary",
};

export type PortalCardTint = "navy" | "sage" | "amber" | "mint" | "rose";

export const PORTAL_CARD_TINTS: Record<
  PortalCardTint,
  { wrap: string; rail: string; meta: string }
> = {
  navy: {
    wrap: "bg-[#182356]/10 text-[#182356] dark:bg-white/10 dark:text-white",
    rail: "bg-[#182356] dark:bg-white/70",
    meta: "text-[#182356]",
  },
  sage: {
    wrap: "bg-[#466d6b]/12 text-[#3d5c5a] dark:bg-[#94bfc8]/15 dark:text-[#d5eeea]",
    rail: "bg-[#466d6b]",
    meta: "text-[#3d5c5a]",
  },
  amber: {
    wrap: "bg-[#f59f21]/16 text-[#8a5608] dark:bg-[#f59f21]/20 dark:text-[#ffd27a]",
    rail: "bg-[#f59f21]",
    meta: "text-[#8a5608]",
  },
  mint: {
    wrap: "bg-[#466d6b]/10 text-[#2f5f55] dark:bg-[#94bfc8]/15 dark:text-[#d5eeea]",
    rail: "bg-[#466d6b]",
    meta: "text-[#2f5f55]",
  },
  rose: {
    wrap: "bg-destructive/10 text-destructive",
    rail: "bg-destructive",
    meta: "text-destructive",
  },
};

export const RESOURCE_CARD_TINT: Record<string, PortalCardTint> = {
  people: "sage",
  "waiting-list": "amber",
  "mailing-lists": "amber",
  events: "navy",
  payments: "mint",
  sponsors: "mint",
  reports: "amber",
  "audit-logs": "rose",
  "app-settings": "navy",
  profile: "sage",
};

export const RESOURCE_HEROES: Record<string, { hero: string; glow: string }> = {
  people: {
    hero: "bg-gradient-to-r from-[#466d6b] via-[#2f4f62] to-[#182356]",
    glow: "bg-chart-4/40",
  },
  "waiting-list": {
    hero: "bg-gradient-to-r from-[#182356] via-[#3d4a8f] to-[#f59f21]",
    glow: "bg-warning/40",
  },
  events: {
    hero: "bg-gradient-to-r from-[#182356] via-[#24356e] to-[#466d6b]",
    glow: "bg-warning/35",
  },
  "mailing-lists": {
    hero: "bg-gradient-to-r from-[#182356] via-[#3d4a8f] to-[#f59f21]",
    glow: "bg-warning/40",
  },
  payments: {
    hero: "bg-gradient-to-r from-[#182356] via-[#2f5f55] to-[#466d6b]",
    glow: "bg-chart-4/35",
  },
  sponsors: {
    hero: "bg-gradient-to-r from-[#466d6b] via-[#24356e] to-[#182356]",
    glow: "bg-chart-4/40",
  },
  reports: {
    hero: "bg-gradient-to-r from-[#182356] via-[#3d4a8f] to-[#f59f21]",
    glow: "bg-warning/40",
  },
  "audit-logs": {
    hero: "bg-gradient-to-r from-[#182356] via-[#4a2248] to-[#9f1239]",
    glow: "bg-destructive/40",
  },
  "app-settings": {
    hero: "bg-gradient-to-r from-[#182356] via-[#24356e] to-[#466d6b]",
    glow: "bg-chart-4/35",
  },
};
