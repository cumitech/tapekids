"use client";

import Link from "next/link";
import { useIsAuthenticated, useTranslate } from "@refinedev/core";

import { AppLogo } from "@/components/shared/brand/app-logo";
import { LocaleSelect } from "@/components/shared/refine-ui/layout/locale-select";
import { ThemeSelect } from "@/components/shared/refine-ui/theme/theme-select";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMounted } from "@/hooks/core/use-mounted.hook";

export function PublicHeader() {
  const { path } = useLocale();
  const translate = useTranslate();
  const { data } = useIsAuthenticated();
  const mounted = useMounted();
  const isAuthenticated = mounted && Boolean(data?.authenticated);

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(15,23,42,0.18)] dark:bg-card">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href={path("/")}
          className="shrink-0 text-white"
          aria-label={translate("brand.name")}
        >
          <AppLogo className="h-10 text-white md:h-12" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-5 font-serif text-[0.9375rem] md:flex">
            {isAuthenticated ? (
              <Link
                href={path("/dashboard")}
                className="transition-colors hover:text-[#e1edef]"
              >
                {translate("landing.dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href={path("/login")}
                  className="transition-colors hover:text-[#e1edef]"
                >
                  {translate("landing.signIn")}
                </Link>
                <Link
                  href={path("/register")}
                  className="transition-colors hover:text-[#e1edef]"
                >
                  {translate("landing.register")}
                </Link>
              </>
            )}
          </nav>
          <Link
            href={path(isAuthenticated ? "/dashboard" : "/login")}
            className="rounded-[10px] bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25 md:hidden"
          >
            {translate(
              isAuthenticated ? "landing.dashboard" : "landing.signIn"
            )}
          </Link>
          <LocaleSelect appearance="inverted" />
          <ThemeSelect appearance="inverted" />
        </div>
      </div>
    </header>
  );
}

PublicHeader.displayName = "PublicHeader";
