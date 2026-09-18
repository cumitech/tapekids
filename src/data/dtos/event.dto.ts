import { DEFAULT_LOCALE } from "@/constants/locales";
import { z } from "zod";

import type { EventScheduleStatus } from "@/constants/event-schedule";
import { nanoid } from "@/lib/api/id";
import { slugify } from "@/lib/api/slug";
import { eventScheduleStatus } from "@/lib/events/event-schedule";
import { isEmptyHtml } from "@/lib/html";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { eventImageSrc } from "@/lib/uploads/event-image";

const optionalImagePath = z
  .union([
    z
      .string()
      .trim()
      .regex(/^\/uploads\/events\/[A-Za-z0-9._-]+$/),
    z.string().trim().url().max(1024),
    z.literal(""),
  ])
  .nullable()
  .optional();

const eventLocaleCopySchema = z.object({
  title: z.string().max(128).optional(),
  summary: z.string().max(280).optional(),
  description: z.string().optional(),
  venue: z.string().max(128).optional(),
});

const eventTranslationsSchema = z
  .object({
    en: eventLocaleCopySchema.optional(),
    fr: eventLocaleCopySchema.optional(),
  })
  .optional();

export const eventBodySchema = z.object({
  title: z.string().trim().min(1).max(128).optional(),
  slug: z.string().trim().min(1).max(128).optional(),
  summary: z.string().trim().min(1).max(280).optional(),
  description: z.string().optional(),
  venue: z.string().trim().min(1).max(128).optional(),
  city: z.string().trim().min(1).max(80),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullable().optional(),
  isPublished: z.boolean().optional(),
  requiresParticipantFee: z.boolean().optional(),
  participantFeeAmount: z.union([z.string(), z.number()]).nullable().optional(),
  currency: z.string().trim().length(3).optional(),
  coordinatorFundAmount: z.union([z.string(), z.number()]).nullable().optional(),
  sponsorFundAmount: z.union([z.string(), z.number()]).nullable().optional(),
  imageUrl: optionalImagePath,
  translations: eventTranslationsSchema,
});

export const createEventSchema = eventBodySchema.superRefine((value, ctx) => {
  const title =
    value.translations?.[DEFAULT_LOCALE]?.title?.trim() || value.title?.trim();
  const summary =
    value.translations?.[DEFAULT_LOCALE]?.summary?.trim() || value.summary?.trim();
  const description =
    value.translations?.[DEFAULT_LOCALE]?.description || value.description;
  const venue =
    value.translations?.[DEFAULT_LOCALE]?.venue?.trim() || value.venue?.trim();

  if (!title) {
    ctx.addIssue({ code: "custom", path: ["title"], message: "Title is required" });
  }
  if (!summary) {
    ctx.addIssue({
      code: "custom",
      path: ["summary"],
      message: "Summary is required",
    });
  }
  if (!description || isEmptyHtml(description)) {
    ctx.addIssue({
      code: "custom",
      path: ["description"],
      message: "Description is required",
    });
  }
  if (!venue) {
    ctx.addIssue({ code: "custom", path: ["venue"], message: "Venue is required" });
  }
});

export const updateEventSchema = eventBodySchema.partial();

export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;

export type EventCreatePayload = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  venue: string;
  city: string;
  startsAt: Date;
  endsAt: Date | null;
  isPublished: boolean;
  requiresParticipantFee: boolean;
  participantFeeAmount: string | null;
  currency: string;
  coordinatorFundAmount: string | null;
  sponsorFundAmount: string | null;
  imageUrl: string | null;
  createdById: string;
};

export type EventUpdatePayload = Partial<
  Omit<EventCreatePayload, "id" | "createdById">
>;

export function parseCreateEvent(body: unknown): CreateEvent {
  return createEventSchema.parse(body);
}

export function parseUpdateEvent(body: unknown): UpdateEvent {
  return updateEventSchema.parse(body);
}

function defaultLocaleField(
  input: {
    translations?: { en?: Record<string, string>; fr?: Record<string, string> };
  } & Record<string, unknown>,
  field: "title" | "summary" | "description" | "venue"
) {
  const fromLocale = input.translations?.[DEFAULT_LOCALE]?.[field];
  const fromRoot = input[field];
  if (typeof fromLocale === "string" && fromLocale.trim()) {
    return field === "description" ? fromLocale : fromLocale.trim();
  }
  if (typeof fromRoot === "string") {
    return field === "description" ? fromRoot : fromRoot.trim();
  }
  return "";
}

export function toCreatePayload(
  input: CreateEvent,
  createdById: string
): EventCreatePayload {
  const title = defaultLocaleField(input, "title");
  const summary = defaultLocaleField(input, "summary");
  const description = sanitizeRichText(defaultLocaleField(input, "description"));
  const venue = defaultLocaleField(input, "venue");
  return {
    id: nanoid(),
    title,
    slug: slugify(input.slug ?? title),
    summary,
    description,
    venue,
    city: input.city,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    isPublished: input.isPublished ?? true,
    requiresParticipantFee: input.requiresParticipantFee ?? false,
    participantFeeAmount:
      input.participantFeeAmount == null
        ? null
        : String(input.participantFeeAmount),
    currency: input.currency ?? "XAF",
    coordinatorFundAmount:
      input.coordinatorFundAmount == null
        ? null
        : String(input.coordinatorFundAmount),
    sponsorFundAmount:
      input.sponsorFundAmount == null ? null : String(input.sponsorFundAmount),
    imageUrl: input.imageUrl ? input.imageUrl : null,
    createdById,
  };
}

export function toUpdatePayload(input: UpdateEvent): EventUpdatePayload {
  const payload: EventUpdatePayload = {};

  if (input.translations?.[DEFAULT_LOCALE]?.title || input.title !== undefined) {
    payload.title = defaultLocaleField(input, "title") || input.title;
  }
  if (input.slug !== undefined) payload.slug = slugify(input.slug);
  if (input.translations?.[DEFAULT_LOCALE]?.summary || input.summary !== undefined) {
    payload.summary = defaultLocaleField(input, "summary") || input.summary;
  }
  if (
    input.translations?.[DEFAULT_LOCALE]?.description ||
    input.description !== undefined
  ) {
    payload.description = sanitizeRichText(
      defaultLocaleField(input, "description") || input.description || ""
    );
  }
  if (input.translations?.[DEFAULT_LOCALE]?.venue || input.venue !== undefined) {
    payload.venue = defaultLocaleField(input, "venue") || input.venue;
  }
  if (input.city !== undefined) payload.city = input.city;
  if (input.startsAt !== undefined) payload.startsAt = input.startsAt;
  if (input.endsAt !== undefined) payload.endsAt = input.endsAt;
  if (input.isPublished !== undefined) payload.isPublished = input.isPublished;
  if (input.requiresParticipantFee !== undefined) {
    payload.requiresParticipantFee = input.requiresParticipantFee;
  }
  if (input.participantFeeAmount !== undefined) {
    payload.participantFeeAmount =
      input.participantFeeAmount == null
        ? null
        : String(input.participantFeeAmount);
  }
  if (input.currency !== undefined) payload.currency = input.currency;
  if (input.coordinatorFundAmount !== undefined) {
    payload.coordinatorFundAmount =
      input.coordinatorFundAmount == null
        ? null
        : String(input.coordinatorFundAmount);
  }
  if (input.sponsorFundAmount !== undefined) {
    payload.sponsorFundAmount =
      input.sponsorFundAmount == null ? null : String(input.sponsorFundAmount);
  }
  if (input.imageUrl !== undefined) {
    payload.imageUrl = input.imageUrl ? input.imageUrl : null;
  }

  return payload;
}

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  scheduleStatus: EventScheduleStatus;
};

export function toPublicEvent(event: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  venue: string;
  city: string;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  imageUrl?: string | null;
}): PublicEvent {
  const startsAt = new Date(event.startsAt).toISOString();
  const endsAt = event.endsAt ? new Date(event.endsAt).toISOString() : null;
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    venue: event.venue,
    city: event.city,
    startsAt,
    endsAt,
    imageUrl: eventImageSrc(event.imageUrl),
    scheduleStatus: eventScheduleStatus(startsAt, endsAt),
  };
}
