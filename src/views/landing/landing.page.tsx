"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useIsAuthenticated, useTranslate } from "@refinedev/core";

import { PublicHeader } from "@/components/shared/refine-ui/layout/public-header";
import { AppFooter } from "@/components/shared/layout/app-footer";
import { LandingEvents } from "@/components/landing/landing-events";
import { MinistryLinks } from "@/components/landing/ministry-links";
import { useLocale } from "@/hooks/core/use-locale.hook";
import type { PublicEvent } from "@/data/dtos/event.dto";

const FEATURES = [
  {
    titleKey: "landing.featurePeopleTitle",
    bodyKey: "landing.featurePeopleBody",
    image: "/landing/yf-cameroun-v5.jpeg",
    imageClass: "object-[58%_center]",
  },
  {
    titleKey: "landing.featureEventsTitle",
    bodyKey: "landing.featureEventsBody",
    image: "/landing/yf-cameroun-v2.jpeg",
    imageClass: "object-[38%_40%]",
  },
  {
    titleKey: "landing.featureInvitesTitle",
    bodyKey: "landing.featureInvitesBody",
    image: "/landing/yf-cameroun-v3.jpeg",
    imageClass: "object-[70%_center]",
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
        <section className="relative isolate overflow-hidden px-4 pb-24 pt-16 text-white md:px-6 md:pb-32 md:pt-24">
          <div aria-hidden className="absolute inset-0 bg-[#146d8f]">
            <div className="absolute inset-y-0 left-0 w-[70%] sm:w-1/2">
              <Image
                src="/landing/yf-cameroun-v7.jpeg"
                alt=""
                fill
                priority
                sizes="50vw"
                className="object-cover object-[center_62%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#146d8f]/10 via-[#146d8f]/20 to-[#146d8f]/55" />
            </div>
            <div className="absolute inset-y-0 right-0 w-[70%] sm:w-1/2">
              <Image
                src="/landing/yf-cameroun-v1.jpeg"
                alt=""
                fill
                sizes="50vw"
                className="object-cover object-[center_42%]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#146d8f]/10 via-[#146d8f]/20 to-[#146d8f]/55" />
            </div>
            <div className="absolute inset-y-0 left-1/2 hidden w-[42%] -translate-x-1/2 md:block">
              <Image
                src="/landing/yf-cameroun-v4.jpeg"
                alt=""
                fill
                sizes="40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#146d8f,transparent_18%,transparent_82%,#146d8f)]" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,109,143,0.5)_0%,rgba(20,109,143,0.22)_46%,rgba(20,109,143,0.04)_76%)]" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-muted" />
          </div>
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center [text-shadow:0_2px_16px_rgba(15,23,42,0.55)]">
            <p className="font-serif text-lg text-[#cfecf7] md:text-xl">
              {translate("landing.welcome")}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
              {translate("landing.headline")}
            </h1>
            <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#cfecf7] md:text-lg">
              {translate("landing.description")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center">
              <Link
                href={isAuthenticated ? path("/dashboard") : path("/login")}
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-warning px-10 py-4 text-lg font-bold tracking-tight text-warning-foreground shadow-[0_14px_32px_rgba(245,159,33,0.42)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffb03a] md:min-h-16 md:px-12 md:text-xl"
              >
                {translate(isAuthenticated ? "landing.ctaDashboard" : "landing.ctaSignIn")}
              </Link>
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
                const title = translate(feature.titleKey);
                return (
                  <article
                    key={feature.titleKey}
                    tabIndex={0}
                    className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image
                      src={feature.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={`object-cover ${feature.imageClass} transition duration-500 group-hover:scale-105`}
                    />
                    <div className="absolute inset-0 flex flex-col justify-end overflow-y-auto bg-gradient-to-t from-[#146d8f]/90 via-[#146d8f]/40 to-transparent p-5 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-2 font-serif text-base leading-relaxed text-[#cfecf7]">
                        {translate(feature.bodyKey)}
                      </p>
                    </div>
                    <span className="sr-only">{title}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl bg-[#1c96c5] text-white shadow-[0_16px_40px_rgba(20,109,143,0.16)] md:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)]">
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 md:py-14">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#cfecf7]">
                {translate("landing.waitingListEyebrow")}
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                {translate("landing.waitingListTitle")}
              </h2>
              <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#cfecf7] md:text-lg">
                {translate("landing.waitingListBody")}
              </p>
              <Link
                href={path("/waiting-list")}
                className="mt-8 inline-flex w-fit items-center rounded-[10px] bg-white px-7 py-2.5 text-sm font-semibold text-primary transition duration-200 hover:bg-[#cfecf7]"
              >
                {translate("landing.waitingListCta")}
              </Link>
            </div>
            <div className="relative h-64 sm:h-80 md:h-full md:min-h-72">
              <Image
                src="/landing/yf-cameroun-v8.jpeg"
                alt=""
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover object-[center_28%]"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-[#1c96c5] to-transparent md:block" />
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-6 md:pb-20">
          <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl bg-[#146d8f] text-white shadow-[0_16px_40px_rgba(20,109,143,0.18)] md:grid-cols-[minmax(16rem,0.95fr)_minmax(0,1.05fr)]">
            <div className="relative order-2 h-64 sm:h-80 md:order-1 md:h-full md:min-h-72">
              <Image
                src="/landing/yf-cameroun-v6.jpeg"
                alt=""
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover object-[center_42%]"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-20 bg-gradient-to-l from-[#146d8f] to-transparent md:block" />
            </div>
            <div className="order-1 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 md:order-2 md:py-14">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#cfecf7]">
                {translate("landing.sponsorsEyebrow")}
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                {translate("landing.sponsorsTitle")}
              </h2>
              <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#cfecf7] md:text-lg">
                {translate("landing.sponsorsBody")}
              </p>
              <Link
                href={path("/sponsors")}
                className="mt-8 inline-flex w-fit items-center rounded-[10px] bg-white px-7 py-2.5 text-sm font-semibold text-primary transition duration-200 hover:bg-[#cfecf7]"
              >
                {translate("landing.sponsorsCta")}
              </Link>
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
            {/* <p className="mt-3 font-serif text-sm text-muted-foreground">
              {translate("landing.study")}
            </p> */}
          </blockquote>
        </section>
        <MinistryLinks />
      </main>

      <AppFooter />
    </div>
  );
}
