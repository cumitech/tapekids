import { z } from "zod";

import type { EventScheduleStatus } from "@/constants/event-schedule";
import { nanoid } from "@/lib/api/id";
import { slugify } from "@/lib/api/slug";
import { pickTranslatedField } from "@/lib/content-i18n/pick";
import { eventScheduleStatus } from "@/lib/events/event-schedule";
import { isEmptyHtml } from "@/lib/html";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { ageBoundError, parseAgeBound } from "@/lib/people/age";
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

const ageBoundField = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .superRefine((value, ctx) => {
    const message = ageBoundError(value);
    if (message) {
      ctx.addIssue({ code: "custom", message });
    }
  });

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
  eventType: z.enum(["camp", "day_event"]).optional(),
  isPublished: z.boolean().optional(),
  requiresParticipantFee: z.boolean().optional(),
  participantFeeAmount: z.union([z.string(), z.number()]).nullable().optional(),
  currency: z.string().trim().length(3).optional(),
  coordinatorFundAmount: z.union([z.string(), z.number()]).nullable().optional(),
  sponsorFundAmount: z.union([z.string(), z.number()]).nullable().optional(),
  imageUrl: optionalImagePath,
  minAge: ageBoundField,
  maxAge: ageBoundField,
  translations: eventTranslationsSchema,
});

export const createEventSchema = eventBodySchema.superRefine((value, ctx) => {
  const title = pickTranslatedField(value.translations, "title", value.title);
  const summary = pickTranslatedField(
    value.translations,
    "summary",
    value.summary
  );
  const description = pickTranslatedField(
    value.translations,
    "description",
    value.description,
    { html: true }
  );
  const venue = pickTranslatedField(value.translations, "venue", value.venue);

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
  eventType: "camp" | "day_event";
  isPublished: boolean;
  requiresParticipantFee: boolean;
  participantFeeAmount: string | null;
  currency: string;
  coordinatorFundAmount: string | null;
  sponsorFundAmount: string | null;
  imageUrl: string | null;
  minAge: number | null;
  maxAge: number | null;
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
  return pickTranslatedField(
    input.translations,
    field,
    input[field],
    { html: field === "description" }
  );
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
    eventType: input.eventType ?? "camp",
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
    minAge: parseAgeBound(input.minAge),
    maxAge: parseAgeBound(input.maxAge),
    createdById,
  };
}

export function toUpdatePayload(input: UpdateEvent): EventUpdatePayload {
  const payload: EventUpdatePayload = {};

  if (
    pickTranslatedField(input.translations, "title") ||
    input.title !== undefined
  ) {
    payload.title = defaultLocaleField(input, "title") || input.title;
  }
  if (input.slug !== undefined) payload.slug = slugify(input.slug);
  if (
    pickTranslatedField(input.translations, "summary") ||
    input.summary !== undefined
  ) {
    payload.summary = defaultLocaleField(input, "summary") || input.summary;
  }
  if (
    pickTranslatedField(input.translations, "description", undefined, {
      html: true,
    }) ||
    input.description !== undefined
  ) {
    payload.description = sanitizeRichText(
      defaultLocaleField(input, "description") || input.description || ""
    );
  }
  if (
    pickTranslatedField(input.translations, "venue") ||
    input.venue !== undefined
  ) {
    payload.venue = defaultLocaleField(input, "venue") || input.venue;
  }
  if (input.city !== undefined) payload.city = input.city;
  if (input.startsAt !== undefined) payload.startsAt = input.startsAt;
  if (input.endsAt !== undefined) payload.endsAt = input.endsAt;
  if (input.eventType !== undefined) payload.eventType = input.eventType;
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
  if (input.minAge !== undefined) payload.minAge = parseAgeBound(input.minAge);
  if (input.maxAge !== undefined) payload.maxAge = parseAgeBound(input.maxAge);

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
  minAge: number | null;
  maxAge: number | null;
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
  minAge?: number | null;
  maxAge?: number | null;
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
    minAge: event.minAge ?? null,
    maxAge: event.maxAge ?? null,
    scheduleStatus: eventScheduleStatus(startsAt, endsAt),
  };
}
