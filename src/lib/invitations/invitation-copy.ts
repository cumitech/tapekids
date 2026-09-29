import type { InvitationAudience } from "@/constants/event-participation";
import { EVENT_TYPES, type EventType } from "@/constants/event-type";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { copyFieldsForLocale } from "@/lib/content-i18n/pick";
import { formatDateTime } from "@/lib/format";
import { invitationLinkValidityCopy } from "@/lib/invitations/expiry";
import { mailGreeting } from "@/lib/mail/greeting";
import { htmlToPlainText } from "@/lib/html";
import { renderTransactionalMailHtml } from "@/lib/mail/layout";
import type { Event } from "@/models/events/event.model";

export type InvitationDraft = {
  subject: Record<AppLocale, string>;
  body: Record<AppLocale, string>;
};

const EVENT_DRAFT_FIELDS = ["title", "summary", "venue"] as const;

function copyFor(event: Event, locale: AppLocale) {
  return copyFieldsForLocale(
    event.translations,
    locale,
    EVENT_DRAFT_FIELDS,
    {
      title: event.title,
      summary: event.summary,
      venue: event.venue,
    },
    { alwaysUseRoot: true }
  );
}

export function formatEventRange(
  startsAt?: string | Date | null,
  endsAt?: string | Date | null,
  locale: AppLocale = DEFAULT_LOCALE
) {
  if (!startsAt) {
    return "";
  }
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return "";
  }
  const startLabel = formatDateTime(start, locale);
  if (!endsAt) {
    return startLabel;
  }
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) {
    return startLabel;
  }
  return `${startLabel} – ${formatDateTime(end, locale)}`;
}

function kindPhrase(audience: InvitationAudience, locale: AppLocale) {
  if (locale === "fr") {
    if (audience === "chaperone") {
      return "comme chaperons / encadreurs";
    }
    if (audience === "participant") {
      return "comme participants";
    }
    return "comme campeurs";
  }
  if (audience === "chaperone") {
    return "as chaperones / encadreurs";
  }
  if (audience === "participant") {
    return "as participants";
  }
  return "as campers";
}

export function eventTypeLabel(eventType: EventType | null | undefined, locale: AppLocale) {
  const type = eventType === EVENT_TYPES.DAY_EVENT ? EVENT_TYPES.DAY_EVENT : EVENT_TYPES.CAMP;
  if (locale === "fr") {
    return type === EVENT_TYPES.DAY_EVENT ? "Journée" : "Camp";
  }
  return type === EVENT_TYPES.DAY_EVENT ? "Day event" : "Camp";
}

function eventTypePhrase(eventType: EventType | null | undefined, locale: AppLocale) {
  const day = eventType === EVENT_TYPES.DAY_EVENT;
  if (locale === "fr") {
    return day ? "pour cette journée" : "pour ce camp";
  }
  return day ? "for this day event" : "for this camp";
}

export function invitationDrafts(
  event: Event,
  audience: InvitationAudience
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
    `<p>We would love you to join ${en.title} ${kindPhrase(audience, "en")} ${eventTypePhrase(event.eventType, "en")} at ${placeEn}${datesEn ? ` from ${datesEn}` : ""}.</p>`,
    summaryEn ? `<p>${summaryEn}</p>` : "",
    "<p>This gathering is for young Christians walking with Christ, anchored in the Word brought by God’s prophet, William Marrion Branham. Place God and His Word first, stay away from the world, and encourage one another.</p>",
    "<p>Open the invitation to confirm a place.</p>",
    `<p>${invitationLinkValidityCopy("en")}</p>`,
  ]
    .filter(Boolean)
    .join("");

  const bodyFr = [
    `<p>Nous serions heureux que vous rejoigniez ${fr.title || en.title} ${kindPhrase(audience, "fr")} ${eventTypePhrase(event.eventType, "fr")} à ${placeFr}${datesFr ? ` du ${datesFr}` : ""}.</p>`,
    summaryFr ? `<p>${summaryFr}</p>` : "",
    "<p>Ce rassemblement est pour les jeunes chrétiens qui marchent avec Christ, ancrés dans la Parole apportée par le prophète de Dieu, William Marrion Branham. Placez Dieu et Sa Parole en premier, restez séparés du monde, et encouragez-vous les uns les autres.</p>",
    "<p>Ouvrez l'invitation pour confirmer une place.</p>",
    `<p>${invitationLinkValidityCopy("fr")}</p>`,
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: {
      fr: `Vous êtes invités à ${fr.title || en.title}`,
      en: `You are invited to ${en.title}`,
    },
    body: {
      fr: bodyFr,
      en: bodyEn,
    },
  };
}

export function invitationMailDetails(
  input: {
    eventTitle: string;
    eventVenue?: string | null;
    eventCity?: string | null;
    startsAt?: string | Date | null;
    endsAt?: string | Date | null;
    eventType?: EventType | null;
  },
  locale: AppLocale
) {
  const where = [input.eventVenue, input.eventCity].filter(Boolean).join(", ");
  const when = formatEventRange(input.startsAt, input.endsAt, locale);
  return [
    { label: locale === "fr" ? "Événement" : "Event", value: input.eventTitle },
    {
      label: locale === "fr" ? "Type" : "Type",
      value: eventTypeLabel(input.eventType, locale),
    },
    { label: locale === "fr" ? "Quand" : "When", value: when },
    { label: locale === "fr" ? "Où" : "Where", value: where },
    {
      label: locale === "fr" ? "Lien" : "Link",
      value: invitationLinkValidityCopy(locale),
    },
  ];
}

export function invitationPreviewHtml(input: {
  firstName?: string;
  eventTitle: string;
  eventVenue?: string | null;
  eventCity?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  eventType?: EventType | null;
  subject: string;
  body: string;
  locale?: AppLocale;
}): string {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const greeting = mailGreeting(input.firstName);
  return renderTransactionalMailHtml({
    locale,
    headerTitle: locale === "fr" ? "Vous êtes invités" : "You are invited",
    preheader: input.subject,
    greeting,
    htmlBody: input.body,
    details: invitationMailDetails(input, locale),
    cta: {
      label: locale === "fr" ? "Accepter l'invitation" : "Accept invitation",
      url: "#",
    },
  });
}
