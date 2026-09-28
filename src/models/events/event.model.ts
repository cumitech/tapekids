import { CONTENT_FIELDS } from "@/constants/content-i18n";
import { LOCALES } from "@/constants/locales";
import {
  copiesByLocale,
  emptyTranslationsForm,
  translationsPayload,
} from "@/lib/content-i18n/pick";
import type { EventFormValues } from "@/types/forms";

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt?: string | null;
  isPublished?: boolean;
  requiresParticipantFee?: boolean;
  participantFeeAmount?: string | number | null;
  currency?: string;
  coordinatorFundAmount?: string | number | null;
  sponsorFundAmount?: string | number | null;
  imageUrl?: string | null;
  eventType?: "camp" | "day_event";
  minAge?: number | null;
  maxAge?: number | null;
  translations?: Partial<
    Record<
      (typeof LOCALES)[number],
      Partial<{
        title: string;
        summary: string;
        description: string;
        venue: string;
      }>
    >
  >;
}

const emptyCopy = {
  title: "",
  summary: "",
  description: "",
  venue: "",
};

export const emptyEventForm: EventFormValues = {
  translations: emptyTranslationsForm(emptyCopy),
  city: "",
  startsAt: "",
  endsAt: "",
  eventType: "camp",
  requiresParticipantFee: false,
  participantFeeAmount: "",
  currency: "XAF",
  coordinatorFundAmount: "",
  sponsorFundAmount: "",
  imageUrl: "",
  minAge: "",
  maxAge: "",
  isPublished: true,
};

export function eventToFormValues(record?: Event | null): EventFormValues {
  return {
    translations: copiesByLocale(
      record?.translations,
      CONTENT_FIELDS.event,
      {
        title: record?.title,
        summary: record?.summary,
        description: record?.description,
        venue: record?.venue,
      }
    ),
    city: record?.city ?? "",
    startsAt: record?.startsAt ? record.startsAt.slice(0, 16) : "",
    endsAt: record?.endsAt ? record.endsAt.slice(0, 16) : "",
    eventType: record?.eventType === "day_event" ? "day_event" : "camp",
    requiresParticipantFee: Boolean(record?.requiresParticipantFee),
    participantFeeAmount:
      record?.participantFeeAmount != null
        ? String(record.participantFeeAmount)
        : "",
    currency: record?.currency ?? "XAF",
    coordinatorFundAmount:
      record?.coordinatorFundAmount != null
        ? String(record.coordinatorFundAmount)
        : "",
    sponsorFundAmount:
      record?.sponsorFundAmount != null
        ? String(record.sponsorFundAmount)
        : "",
    imageUrl: record?.imageUrl ?? "",
    minAge: record?.minAge != null ? String(record.minAge) : "",
    maxAge: record?.maxAge != null ? String(record.maxAge) : "",
    isPublished: record?.isPublished ?? true,
  };
}

export function eventFormToPayload(values: EventFormValues) {
  return {
    city: values.city,
    startsAt: values.startsAt,
    endsAt: values.endsAt || null,
    eventType: values.eventType,
    requiresParticipantFee: values.requiresParticipantFee,
    participantFeeAmount: values.participantFeeAmount || null,
    currency: values.currency || "XAF",
    imageUrl: values.imageUrl.trim() || null,
    isPublished: values.isPublished,
    translations: translationsPayload(values.translations),
  };
}
