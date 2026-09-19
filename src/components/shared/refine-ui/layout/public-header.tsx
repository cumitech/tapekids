"use client";

import Link from "next/link";
import { useIsAuthenticated, useTranslate } from "@refinedev/core";

import { AppLogo } from "@/components/shared/brand/app-logo";
import { LocaleSelect } from "@/components/shared/refine-ui/layout/locale-select";
import { MobileNavPreferences, MobileNavSheet } from "@/components/shared/refine-ui/layout/mobile-nav-sheet";
import { ThemeSelect } from "@/components/shared/refine-ui/theme/theme-select";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMounted } from "@/hooks/core/use-mounted.hook";

function PublicNavLinks({
  isAuthenticated,
  onPrimary,
}: {
  isAuthenticated: boolean;
  onPrimary?: boolean;
}) {
  const { path } = useLocale();
  const translate = useTranslate();
  const links = isAuthenticated
    ? [{ href: path("/dashboard"), label: translate("landing.dashboard") }]
    : [
        { href: path("/login"), label: translate("landing.signIn") },
        { href: path("/register"), label: translate("landing.register") },
      ];

  if (onPrimary) {
    return (
      <nav className="flex items-center gap-5 font-serif text-[0.9375rem]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-[#e1edef]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function PublicHeader() {
  const { path } = useLocale();
  const translate = useTranslate();
  const { data } = useIsAuthenticated();
  const mounted = useMounted();
  const isAuthenticated = mounted && Boolean(data?.authenticated);

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(15,23,42,0.18)] dark:bg-card">
      <div className="mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center justify-between gap-3 overflow-x-clip px-3 md:h-[4.5rem] md:px-6">
        <Link
          href={path("/")}
          className="min-w-0 shrink text-white"
          aria-label={translate("brand.name")}
        >
          <AppLogo className="h-8 max-w-full text-white md:h-12" />
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          <PublicNavLinks isAuthenticated={isAuthenticated} onPrimary />
          <LocaleSelect appearance="inverted" />
          <ThemeSelect appearance="inverted" />
        </div>
        <MobileNavSheet
          title={translate("dashboard.navigation")}
          triggerClassName="text-white hover:bg-white/15 hover:text-white md:hidden"
        >
          <PublicNavLinks isAuthenticated={isAuthenticated} />
          <MobileNavPreferences />
        </MobileNavSheet>
      </div>
    </header>
  );
}

PublicHeader.displayName = "PublicHeader";
