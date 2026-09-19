import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { DEFAULT_LOCALE } from "@/constants/locales";
import {
  parseCreateEvent,
  parseUpdateEvent,
  toCreatePayload,
  toPublicEvent,
  toUpdatePayload,
} from "@/data/dtos/event.dto";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { EventMembershipRepository } from "@/data/repositories/event-membership.repository";
import { EventRepository } from "@/data/repositories/event.repository";
import type { ListQuery } from "@/data/types/pagination";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { translationsFromInput } from "@/lib/content-i18n/input";
import { slugify } from "@/lib/api/slug";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { auditService } from "@/services/audit/audit.service";

const eventRepository = new EventRepository();
const eventMembershipRepository = new EventMembershipRepository();

function eventTranslations(input: {
  translations?: {
    en?: { title?: string; summary?: string; description?: string; venue?: string };
    fr?: { title?: string; summary?: string; description?: string; venue?: string };
  };
  title?: string;
  summary?: string;
  description?: string;
  venue?: string;
}) {
  const translations = translationsFromInput(
    CONTENT_ENTITY_TYPES.event,
    input,
    {
      title: input.title,
      summary: input.summary,
      description: input.description,
      venue: input.venue,
    }
  );
  for (const locale of Object.keys(translations) as Array<keyof typeof translations>) {
    const description = translations[locale]?.description;
    if (description) {
      translations[locale]!.description = sanitizeRichText(description);
    }
  }
  return translations;
}

export class EventService {
  async list(query: ListQuery, locale?: string) {
    const result = await eventRepository.list(query);
    return {
      ...result,
      data: await contentTranslationRepository.localize(
        CONTENT_ENTITY_TYPES.event,
        result.data,
        resolveContentLocale(locale)
      ),
    };
  }

  async listPublished(locale?: string) {
    const events = await eventRepository.listPublished();
    const localized = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.event,
      events,
      resolveContentLocale(locale)
    );
    return localized.map(toPublicEvent);
  }

  async getPublishedBySlug(slug: string, locale?: string) {
    const event = await eventRepository.findPublishedBySlug(slug);
    const [localized] = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.event,
      [event],
      resolveContentLocale(locale)
    );
    return toPublicEvent(localized);
  }

  async getById(id: string, locale?: string) {
    const event = await eventRepository.findById(id);
    const [localized] = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.event,
      [event],
      resolveContentLocale(locale),
      true
    );
    return localized;
  }

  async create(body: unknown, createdById: string) {
    const input = parseCreateEvent(body);
    const payload = toCreatePayload(input, createdById);
    payload.slug = await this.uniqueSlug(payload.slug);
    const event = await eventRepository.create(payload);
    await contentTranslationRepository.replace(
      CONTENT_ENTITY_TYPES.event,
      event.id,
      eventTranslations(input)
    );
    const created = await this.getById(event.id);
    await auditService.record({
      action: "create",
      entity: "Event",
      entityId: event.id,
      after: created,
    });
    return created;
  }

  async update(id: string, body: unknown) {
    const before = await eventRepository.findById(id);
    const input = parseUpdateEvent(body);
    const payload = toUpdatePayload(input);
    if (payload.slug) {
      payload.slug = await this.uniqueSlug(payload.slug, id);
    }
    await eventRepository.update(id, payload);
    if (input.translations || input.title || input.summary || input.description || input.venue) {
      await contentTranslationRepository.replace(
        CONTENT_ENTITY_TYPES.event,
        id,
        eventTranslations({
          ...input,
          title: input.title ?? before.title,
          summary: input.summary ?? before.summary,
          description: input.description ?? before.description,
          venue: input.venue ?? before.venue,
        })
      );
    }
    const event = await this.getById(id);
    await auditService.record({
      action: "update",
      entity: "Event",
      entityId: id,
      before,
      after: event,
    });
    return event;
  }

  async delete(id: string) {
    const before = await eventRepository.findById(id);
    await eventRepository.delete(id);
    await auditService.record({
      action: "delete",
      entity: "Event",
      entityId: id,
      before,
    });
  }

  async listMemberships(eventId: string) {
    await this.getById(eventId);
    return eventMembershipRepository.listByEvent(eventId);
  }

  private async uniqueSlug(base: string, ignoreId?: string): Promise<string> {
    let slug = slugify(base);
    let suffix = 2;

    while (true) {
      const existing = await eventRepository.findBySlug(slug);
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      slug = `${slugify(base).slice(0, 120)}-${suffix}`;
      suffix += 1;
    }
  }
}

export const eventService = new EventService();
