import {
  ClipboardList,
  HeartHandshake,
  Shield,
  Sparkles,
  Tent,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type PortalTone = "camp" | "sponsor" | "staff" | "admin" | "guest" | "profile";

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
  staff: {
    hero: "bg-gradient-to-br from-[#466d6b] via-[#3d6a5c] to-[#2f4f62]",
    glow: "bg-chart-4/40",
    iconWrap: "bg-white/15 text-white",
    Icon: ClipboardList,
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
    wrap: "bg-primary text-primary-foreground",
    rail: "bg-primary",
    meta: "text-primary",
  },
  sage: {
    wrap: "bg-secondary text-secondary-foreground",
    rail: "bg-secondary",
    meta: "text-secondary",
  },
  amber: {
    wrap: "bg-warning text-warning-foreground",
    rail: "bg-warning",
    meta: "text-warning-foreground",
  },
  mint: {
    wrap: "bg-accent text-primary",
    rail: "bg-chart-4",
    meta: "text-primary",
  },
  rose: {
    wrap: "bg-destructive/15 text-destructive",
    rail: "bg-destructive",
    meta: "text-destructive",
  },
};

export const RESOURCE_CARD_TINT: Record<string, PortalCardTint> = {
  people: "sage",
  "mailing-lists": "amber",
  events: "navy",
  "audit-logs": "rose",
  profile: "sage",
};

export const RESOURCE_HEROES: Record<string, { hero: string; glow: string }> = {
  people: {
    hero: "bg-gradient-to-r from-[#466d6b] via-[#2f4f62] to-[#182356]",
    glow: "bg-chart-4/40",
  },
  events: {
    hero: "bg-gradient-to-r from-[#182356] via-[#24356e] to-[#466d6b]",
    glow: "bg-warning/35",
  },
  "mailing-lists": {
    hero: "bg-gradient-to-r from-[#182356] via-[#3d4a8f] to-[#f59f21]",
    glow: "bg-warning/40",
  },
  "audit-logs": {
    hero: "bg-gradient-to-r from-[#182356] via-[#4a2248] to-[#9f1239]",
    glow: "bg-destructive/40",
  },
};
