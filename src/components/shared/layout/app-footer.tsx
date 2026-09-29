"use client";

import { useTranslate } from "@refinedev/core";

import { AppLogoMark } from "@/components/shared/brand/app-logo";
import { cn } from "@/lib/utils";

const PALETTE = [
  { className: "bg-[#1c96c5]", label: "Sky" },
  { className: "bg-[#90becb]", label: "Logo" },
  { className: "bg-warning", label: "Warning" },
  { className: "bg-destructive", label: "Danger" },
] as const;

export function AppFooter({ className }: { className?: string }) {
  const translate = useTranslate();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-[#0f4e62] via-[#146d8f] to-[#1c96c5] text-white",
        className
      )}
    >
      <span className="pointer-events-none absolute -top-12 right-8 size-40 rounded-full bg-warning/30 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-16 left-1/4 size-48 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute bottom-0 right-1/3 h-1 w-40 bg-destructive/70" />
      <div className="relative mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AppLogoMark onDark className="h-20 drop-shadow-[0_1px_1px_rgba(8,40,52,0.35)]" />
          <div>
            <p className="font-serif text-base tracking-tight">
              {translate("brand.name")}
            </p>
            <p className="text-xs text-white/75">
              {translate("landing.footerTagline")}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5"
          aria-hidden
        >
          {PALETTE.map((swatch) => (
            <span
              key={swatch.label}
              title={swatch.label}
              className={cn("size-2.5 rounded-full ring-1 ring-white/50", swatch.className)}
            />
          ))}
        </div>
        <p className="min-w-0 shrink font-serif text-sm text-white/80" suppressHydrationWarning>
          © {year} {translate("landing.footer")}
        </p>
      </div>
    </footer>
  );
}
