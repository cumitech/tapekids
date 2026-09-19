"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import { useTranslate } from "@refinedev/core";

import { AppLogo } from "@/components/shared/brand/app-logo";
import { AppFooter } from "@/components/shared/layout/app-footer";
import { AppModalProvider } from "@/components/shared/modals/app-modal";
import { GuestOnboardingAlert } from "@/components/portal/guest-onboarding-alert";
import { HeaderTools } from "@/components/shared/refine-ui/layout/header-tools";
import { LayoutHeaderBar } from "@/components/shared/refine-ui/layout/layout-header-bar";
import { MobileNavPreferences, MobileNavSheet } from "@/components/shared/refine-ui/layout/mobile-nav-sheet";
import { ResourceRouteGuard } from "@/components/shared/refine-ui/layout/resource-route-guard";
import { UserMenu } from "@/components/shared/refine-ui/layout/user-menu";
import { GUEST_NAV_ITEMS } from "@/constants/guest-portal";
import { LAYOUT_CHROME_BG } from "@/constants/layout";
import { MeProvider } from "@/hooks/core/use-me.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { cn } from "@/lib/utils";

export function GuestPortalLayout({ children }: PropsWithChildren) {
  const translate = useTranslate();
  const { path } = useLocale();

  return (
    <AppModalProvider>
      <MeProvider>
      <div className={cn("flex min-h-svh min-w-0 flex-col", LAYOUT_CHROME_BG)}>
        <LayoutHeaderBar className="px-3 sm:px-6">
          <Link
            href={path("/dashboard")}
            className="min-w-0 shrink text-primary"
            aria-label={translate("brand.name")}
          >
            <AppLogo className="h-8" />
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center gap-3 text-sm font-medium md:flex">
            {GUEST_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                className="shrink-0 hover:text-primary"
                href={path(item.href)}
              >
                {translate(item.labelKey)}
              </Link>
            ))}
          </nav>
          <HeaderTools className="hidden md:flex" />
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <UserMenu />
            <MobileNavSheet title={translate("dashboard.navigation")}>
              <nav className="flex flex-col gap-1 px-3 py-3">
                {GUEST_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={path(item.href)}
                    className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                  >
                    {translate(item.labelKey)}
                  </Link>
                ))}
              </nav>
              <MobileNavPreferences />
            </MobileNavSheet>
          </div>
        </LayoutHeaderBar>
        <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
          <GuestOnboardingAlert />
          <ResourceRouteGuard>{children}</ResourceRouteGuard>
        </main>
        <AppFooter />
      </div>
      </MeProvider>
    </AppModalProvider>
  );
}
