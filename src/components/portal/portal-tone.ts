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
    hero: "bg-gradient-to-br from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-warning/45",
    iconWrap: "bg-white/15 text-white",
    Icon: Tent,
  },
  sponsor: {
    hero: "bg-gradient-to-br from-[#0f4e62] via-[#4d7c86] to-[#1c96c5]",
    glow: "bg-chart-4/45",
    iconWrap: "bg-white/15 text-white",
    Icon: HeartHandshake,
  },
  admin: {
    hero: "bg-gradient-to-br from-[#0f4e62] via-[#1c96c5] to-[#146d8f]",
    glow: "bg-warning/35",
    iconWrap: "bg-white/15 text-white",
    Icon: Shield,
  },
  guest: {
    hero: "bg-gradient-to-br from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-warning/50",
    iconWrap: "bg-white/15 text-white",
    Icon: Sparkles,
  },
  profile: {
    hero: "bg-gradient-to-br from-[#1c96c5] via-[#146d8f] to-[#0f4e62]",
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
    wrap: "bg-[#146d8f]/10 text-[#146d8f] dark:bg-[#90becb]/15 dark:text-[#d7eef3]",
    rail: "bg-[#146d8f] dark:bg-[#90becb]",
    meta: "text-[#146d8f]",
  },
  sage: {
    wrap: "bg-[#90becb]/35 text-[#3e6e78] dark:bg-[#90becb]/15 dark:text-[#d7eef3]",
    rail: "bg-[#4d7c86]",
    meta: "text-[#3e6e78]",
  },
  amber: {
    wrap: "bg-[#f59f21]/16 text-[#8a5608] dark:bg-[#f59f21]/20 dark:text-[#ffd27a]",
    rail: "bg-[#f59f21]",
    meta: "text-[#8a5608]",
  },
  mint: {
    wrap: "bg-[#90becb]/28 text-[#0f4e62] dark:bg-[#90becb]/15 dark:text-[#d7eef3]",
    rail: "bg-[#90becb]",
    meta: "text-[#3e6e78]",
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
    hero: "bg-gradient-to-r from-[#4d7c86] via-[#146d8f] to-[#0f4e62]",
    glow: "bg-chart-4/40",
  },
  "waiting-list": {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-warning/40",
  },
  events: {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-warning/35",
  },
  "mailing-lists": {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#4d7c86]",
    glow: "bg-warning/40",
  },
  payments: {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#3e6e78] to-[#146d8f]",
    glow: "bg-chart-4/35",
  },
  sponsors: {
    hero: "bg-gradient-to-r from-[#4d7c86] via-[#146d8f] to-[#0f4e62]",
    glow: "bg-chart-4/40",
  },
  reports: {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-warning/40",
  },
  "audit-logs": {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#4a2248] to-[#9f1239]",
    glow: "bg-destructive/40",
  },
  "app-settings": {
    hero: "bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#1c96c5]",
    glow: "bg-chart-4/35",
  },
};
