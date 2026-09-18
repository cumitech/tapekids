import { LOCALES, type AppLocale } from "@/constants/locales";
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
  translations?: Partial<
    Record<
      AppLocale,
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
  translations: {
    en: { ...emptyCopy },
    fr: { ...emptyCopy },
  },
  city: "",
  startsAt: "",
  endsAt: "",
  requiresParticipantFee: false,
  participantFeeAmount: "",
  currency: "XAF",
  coordinatorFundAmount: "",
  sponsorFundAmount: "",
  imageUrl: "",
  isPublished: true,
};

function copyFor(record: Event | null | undefined, locale: AppLocale) {
  const translated = record?.translations?.[locale];
  return {
    title: translated?.title || (locale === "en" ? record?.title ?? "" : ""),
    summary: translated?.summary || (locale === "en" ? record?.summary ?? "" : ""),
    description:
      translated?.description || (locale === "en" ? record?.description ?? "" : ""),
    venue: translated?.venue || (locale === "en" ? record?.venue ?? "" : ""),
  };
}

export function eventToFormValues(record?: Event | null): EventFormValues {
  return {
    translations: {
      en: copyFor(record, "en"),
      fr: copyFor(record, "fr"),
    },
    city: record?.city ?? "",
    startsAt: record?.startsAt ? record.startsAt.slice(0, 16) : "",
    endsAt: record?.endsAt ? record.endsAt.slice(0, 16) : "",
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
    isPublished: record?.isPublished ?? true,
  };
}

export function eventFormToPayload(values: EventFormValues) {
  return {
    city: values.city,
    startsAt: values.startsAt,
    endsAt: values.endsAt || null,
    requiresParticipantFee: values.requiresParticipantFee,
    participantFeeAmount: values.participantFeeAmount || null,
    currency: values.currency || "XAF",
    coordinatorFundAmount: values.coordinatorFundAmount || null,
    sponsorFundAmount: values.sponsorFundAmount || null,
    imageUrl: values.imageUrl.trim() || null,
    isPublished: values.isPublished,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, values.translations[locale]])
    ),
  };
}
