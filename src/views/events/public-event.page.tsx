"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { EventImage } from "@/components/events/event-image";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";
import { AppFooter } from "@/components/shared/layout/app-footer";
import { PublicHeader } from "@/components/shared/refine-ui/layout/public-header";
import { RichText } from "@/components/shared/rich-text";
import type { PublicEvent } from "@/data/dtos/event.dto";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatDateTime } from "@/lib/format";

export function PublicEventPage({ event }: { event: PublicEvent }) {
  const translate = useTranslate();
  const { locale, path } = useLocale();

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#182356] via-[#24356e] to-[#466d6b] text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:px-6 md:py-14">
            <div className="min-w-0">
              <Link
                href={path("/")}
                className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <ArrowLeft className="size-4" />
                {translate("events.public.back")}
              </Link>
              <div className="mb-4">
                <EventScheduleBadge status={event.scheduleStatus} />
              </div>
              <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
                {event.title}
              </h1>
              <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-white/80 md:text-lg">
                {event.summary}
              </p>
              <div className="mt-6 flex flex-col gap-3 text-sm text-white/85">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {formatDateTime(event.startsAt, locale)}
                    {event.endsAt
                      ? ` to ${formatDateTime(event.endsAt, locale)}`
                      : ""}
                  </span>
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white/10 shadow-lg">
              <EventImage
                src={event.imageUrl}
                alt={event.title}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <section className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10 md:px-6 md:py-14">
          <RichText html={event.description} />
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
