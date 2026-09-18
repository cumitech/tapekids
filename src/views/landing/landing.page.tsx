"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartHandshake, Palette, BookOpen } from "lucide-react";
import { useIsAuthenticated, useTranslate } from "@refinedev/core";

import { PublicHeader } from "@/components/shared/refine-ui/layout/public-header";
import { AppFooter } from "@/components/shared/layout/app-footer";
import { LandingEvents } from "@/components/landing/landing-events";
import { useLocale } from "@/hooks/core/use-locale.hook";
import type { PublicEvent } from "@/data/dtos/event.dto";

const FEATURES = [
  {
    titleKey: "landing.featurePeopleTitle",
    bodyKey: "landing.featurePeopleBody",
    icon: HeartHandshake,
  },
  {
    titleKey: "landing.featureEventsTitle",
    bodyKey: "landing.featureEventsBody",
    icon: Palette,
  },
  {
    titleKey: "landing.featureInvitesTitle",
    bodyKey: "landing.featureInvitesBody",
    icon: BookOpen,
  },
] as const;

export function LandingPage({ events = [] }: { events?: PublicEvent[] }) {
  const translate = useTranslate();
  const { path } = useLocale();
  const { data } = useIsAuthenticated();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && Boolean(data?.authenticated);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex flex-1 flex-col">
        <section className="bg-gradient-to-b from-[#182356] via-[#24356e] to-[#466d6b] px-4 pb-20 pt-12 text-white md:px-6 md:pb-28 md:pt-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <p className="mt-8 font-serif text-lg text-[#e1edef] md:text-xl">
              {translate("landing.welcome")}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
              {translate("landing.headline")}
            </h1>
            <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#e1edef] md:text-lg">
              {translate("landing.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  href={path("/dashboard")}
                  className="inline-flex items-center rounded-[10px] bg-white px-7 py-2.5 text-sm font-semibold text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-[#e1edef]"
                >
                  {translate("landing.ctaDashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href={path("/login")}
                    className="inline-flex items-center rounded-[10px] bg-secondary px-7 py-2.5 text-sm font-semibold text-secondary-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-secondary/90"
                  >
                    {translate("landing.ctaSignIn")}
                  </Link>
                  <Link
                    href={path("/register")}
                    className="inline-flex items-center rounded-[10px] border border-white/70 px-7 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    {translate("landing.ctaRegister")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="bg-muted px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-center font-serif text-xl font-semibold text-secondary md:text-2xl">
              {translate("landing.sections")}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.titleKey}
                    className="rounded-xl border border-transparent bg-card p-6 shadow-sm transition-colors hover:border-secondary"
                  >
                    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent text-secondary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {translate(feature.titleKey)}
                    </h3>
                    <p className="mt-2 font-serif text-[1.0625rem] leading-relaxed text-muted-foreground">
                      {translate(feature.bodyKey)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <LandingEvents events={events} />

        <section className="px-4 py-16 md:px-6">
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl leading-snug text-foreground italic">
              {translate("landing.quote")}
            </p>
            <footer className="mt-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {translate("landing.quoteRef")}
            </footer>
            <p className="mt-3 font-serif text-sm text-muted-foreground">
              {translate("landing.study")}
            </p>
          </blockquote>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
