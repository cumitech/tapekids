"use client";

import { useTranslate } from "@refinedev/core";

import { APP_NAME } from "@/constants/brand";
import type { AppLocale } from "@/constants/locales";
import { fieldForLocale } from "@/lib/content-i18n/pick";
import { eventTypeLabel, formatEventRange } from "@/lib/invitations/invitation-copy";
import { mailGreeting } from "@/lib/mail/greeting";
import { RichText } from "@/components/shared/rich-text";
import type { Event } from "@/models/events/event.model";

type InvitationEmailPreviewProps = {
  event?: Event | null;
  locale: AppLocale;
  subject: string;
  body: string;
};

export function InvitationEmailPreview({
  event,
  locale,
  subject,
  body,
}: InvitationEmailPreviewProps) {
  const translate = useTranslate();
  const title =
    fieldForLocale(event?.translations, locale, "title", event?.title, {
      alwaysUseRoot: true,
    }) || translate("mailingLists.selectEvent");
  const venue = fieldForLocale(
    event?.translations,
    locale,
    "venue",
    event?.venue,
    { alwaysUseRoot: true }
  );
  const where = [venue, event?.city].filter(Boolean).join(", ");
  const when = formatEventRange(event?.startsAt, event?.endsAt, locale);
  const details = [
    { label: locale === "fr" ? "Événement" : "Event", value: title },
    {
      label: locale === "fr" ? "Type" : "Type",
      value: event ? eventTypeLabel(event.eventType, locale) : "",
    },
    { label: locale === "fr" ? "Quand" : "When", value: when },
    { label: locale === "fr" ? "Où" : "Where", value: where },
  ].filter((row) => row.value);
  const cta =
    locale === "fr" ? "Accepter l'invitation" : "Accept invitation";
  const headerTitle =
    locale === "fr" ? "Vous êtes invités" : "You are invited";
  const footer =
    locale === "fr"
      ? `${APP_NAME}. Young Foundations, Creations et Cub Corner. Placez Dieu et Sa Parole en premier.`
      : `${APP_NAME}. Young Foundations, Creations, and Cub Corner. Place God and His Word first.`;

  return (
    <aside className="flex min-w-0 flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold">
          {translate("mailingLists.invitationPreview")}
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl border bg-[#e8f4f7] shadow-sm">
        <p className="border-b bg-white px-4 py-2 text-xs text-muted-foreground">
          {translate("mailingLists.fields.subject")}:{" "}
          <span className="text-foreground">{subject || "-"}</span>
        </p>
        {event && (subject || body) ? (
          <div className="px-3 py-5">
            <article className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,78,98,0.12)]">
              <header className="bg-[#146d8f] px-8 py-7 text-white">
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#e7f6fb]">
                  {APP_NAME}
                </p>
                <h4 className="text-2xl font-bold leading-snug">{headerTitle}</h4>
              </header>
              <div className="px-8 pb-2 pt-7 font-serif text-[16px] leading-relaxed text-[#16343c]">
                <p className="mb-4">{mailGreeting()}</p>
                <RichText
                  html={body}
                  className="text-[#16343c] [&_p]:font-serif"
                />
                {details.length ? (
                  <div className="mb-6 rounded-xl bg-[#e7f6fb] px-[18px] py-4">
                    {details.map((row) => (
                      <p
                        key={row.label}
                        className="mb-2.5 last:mb-0 text-[13px] leading-normal"
                      >
                        <strong className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-[#3e6e78]">
                          {row.label}
                        </strong>
                        {row.value}
                      </p>
                    ))}
                  </div>
                ) : null}
                <p className="mb-6">
                  <span className="inline-block rounded-[10px] bg-[#146d8f] px-[22px] py-3 text-[15px] font-bold text-white">
                    {cta}
                  </span>
                </p>
              </div>
              <footer className="px-8 pb-7 font-sans">
                <p className="border-t border-[#e7f6fb] pt-4 text-xs leading-normal text-[#596466]">
                  {footer}
                </p>
              </footer>
            </article>
          </div>
        ) : (
          <p className="bg-white px-4 py-16 text-center text-sm text-muted-foreground">
            {translate("mailingLists.invitationPreviewEmpty")}
          </p>
        )}
      </div>
    </aside>
  );
}
