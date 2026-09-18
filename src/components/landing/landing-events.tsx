"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import Link from "next/link";

import { EventImage } from "@/components/events/event-image";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";

import type { PublicEvent } from "@/data/dtos/event.dto";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatDateTime } from "@/lib/format";

export function LandingEvents({ events }: { events: PublicEvent[] }) {
  const translate = useTranslate();
  const { locale, path } = useLocale();

  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-center font-serif text-xl font-semibold text-secondary md:text-2xl">
          {translate("landing.eventsTitle")}
        </h2>
        {events.length === 0 ? (
          <p className="mx-auto mt-8 max-w-lg text-center font-serif text-base text-muted-foreground">
            {translate("landing.eventsEmpty")}
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={path(`/events/${event.slug}`)}
                className="group overflow-hidden rounded-xl border border-transparent bg-card shadow-sm transition-colors hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <article>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <EventImage
                      src={event.imageUrl}
                      alt={event.title}
                      className="size-full group-hover:[&_img]:scale-[1.03] group-hover:[&_img]:transition-transform"
                    />
                    <div className="absolute left-3 top-3">
                      <EventScheduleBadge status={event.scheduleStatus} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                      {event.title}
                    </h3>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                      <span>
                        {event.venue}, {event.city}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary" />
                      <span>
                        {formatDateTime(event.startsAt, locale)}
                        {event.endsAt
                          ? ` to ${formatDateTime(event.endsAt, locale)}`
                          : ""}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-3 font-serif text-[1.0625rem] leading-relaxed text-muted-foreground">
                      {event.summary}
                    </p>
                    <span className="mt-1 text-sm font-medium text-primary">
                      {translate("events.public.viewDetails")}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
