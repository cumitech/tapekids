import type { EventMembershipKind } from "@/constants/event-participation";
import type { AppLocale } from "@/constants/locales";
import { mailGreeting } from "@/lib/mail/greeting";
import { htmlToPlainText } from "@/lib/html";
import { renderTransactionalMailHtml } from "@/lib/mail/layout";
import type { Event } from "@/models/events/event.model";

export type InvitationDraft = {
  subject: Record<AppLocale, string>;
  body: Record<AppLocale, string>;
};

function copyFor(event: Event, locale: AppLocale) {
  const translated = event.translations?.[locale];
  return {
    title: translated?.title || (locale === "en" ? event.title : "") || event.title,
    summary:
      translated?.summary || (locale === "en" ? event.summary : "") || event.summary,
    venue: translated?.venue || (locale === "en" ? event.venue : "") || event.venue,
  };
}

export function formatEventRange(
  startsAt?: string | Date | null,
  endsAt?: string | Date | null,
  locale: AppLocale = "en"
) {
  if (!startsAt) {
    return "";
  }
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return "";
  }
  const loc = locale === "fr" ? "fr-CM" : "en-GB";
  const format = (value: Date) =>
    new Intl.DateTimeFormat(loc, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(value);
  if (!endsAt) {
    return format(start);
  }
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) {
    return format(start);
  }
  return `${format(start)} to ${format(end)}`;
}

function kindPhrase(kind: EventMembershipKind, locale: AppLocale) {
  if (locale === "fr") {
    if (kind === "coordinator") {
      return "comme coordinateurs";
    }
    if (kind === "sponsor") {
      return "comme parrains";
    }
    return "comme campeurs";
  }
  if (kind === "coordinator") {
    return "as coordinators";
  }
  if (kind === "sponsor") {
    return "as sponsors";
  }
  return "as campers";
}

export function invitationDrafts(
  event: Event,
  kind: EventMembershipKind
): InvitationDraft {
  const en = copyFor(event, "en");
  const fr = copyFor(event, "fr");
  const datesEn = formatEventRange(event.startsAt, event.endsAt, "en");
  const datesFr = formatEventRange(event.startsAt, event.endsAt, "fr");
  const placeEn = [en.venue, event.city].filter(Boolean).join(", ");
  const placeFr = [fr.venue || en.venue, event.city].filter(Boolean).join(", ");
  const summaryEn = htmlToPlainText(en.summary || "");
  const summaryFr = htmlToPlainText(fr.summary || en.summary || "");

  const bodyEn = [
    `<p>We would love you to join ${en.title} ${kindPhrase(kind, "en")} at ${placeEn}${datesEn ? ` from ${datesEn}` : ""}.</p>`,
    summaryEn ? `<p>${summaryEn}</p>` : "",
    "<p>This gathering is for young Christians walking with Christ, anchored in the Word brought by God’s prophet, William Marrion Branham. Place God and His Word first, stay away from the world, and encourage one another.</p>",
    "<p>Open the invitation to confirm a place.</p>",
  ]
    .filter(Boolean)
    .join("");

  const bodyFr = [
    `<p>Nous serions heureux que vous rejoigniez ${fr.title || en.title} ${kindPhrase(kind, "fr")} à ${placeFr}${datesFr ? ` du ${datesFr}` : ""}.</p>`,
    summaryFr ? `<p>${summaryFr}</p>` : "",
    "<p>Ce rassemblement est pour les jeunes chrétiens qui marchent avec Christ, ancrés dans la Parole apportée par le prophète de Dieu, William Marrion Branham. Placez Dieu et Sa Parole en premier, restez séparés du monde, et encouragez-vous les uns les autres.</p>",
    "<p>Ouvrez l'invitation pour confirmer une place.</p>",
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: {
      en: `You are invited to ${en.title}`,
      fr: `Vous êtes invités à ${fr.title || en.title}`,
    },
    body: {
      en: bodyEn,
      fr: bodyFr,
    },
  };
}

export function invitationPreviewHtml(input: {
  firstName?: string;
  eventTitle: string;
  eventVenue?: string | null;
  eventCity?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  subject: string;
  body: string;
  locale?: AppLocale;
}): string {
  const locale = input.locale ?? "en";
  const greeting = mailGreeting(input.firstName);
  const where = [input.eventVenue, input.eventCity].filter(Boolean).join(", ");
  const when = formatEventRange(input.startsAt, input.endsAt, locale);
  return renderTransactionalMailHtml({
    locale,
    headerTitle: locale === "fr" ? "Vous êtes invités" : "You are invited",
    preheader: input.subject,
    greeting,
    htmlBody: input.body,
    details: [
      { label: locale === "fr" ? "Événement" : "Event", value: input.eventTitle },
      { label: locale === "fr" ? "Quand" : "When", value: when },
      { label: locale === "fr" ? "Où" : "Where", value: where },
    ],
    cta: {
      label: locale === "fr" ? "Accepter l'invitation" : "Accept invitation",
      url: "#",
    },
  });
}
