import { Event } from "@/data/entities";
import type { EventCreatePayload, EventUpdatePayload } from "@/data/dtos/event.dto";
import { listSearchWhere } from "@/data/list-where";
import { EVENT_LIST_ATTRIBUTES } from "@/data/query-shape";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

export class EventRepository {
  async create(payload: EventCreatePayload): Promise<Event> {
    return Event.create(payload);
  }

  async findById(id: string): Promise<Event> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundException("Event", id);
    }
    return event;
  }

  async findByJoinToken(joinToken: string): Promise<Event | null> {
    return Event.findOne({ where: { joinToken } });
  }

  async setJoinToken(id: string, joinToken: string): Promise<void> {
    const [updated] = await Event.update({ joinToken }, { where: { id } });
    if (!updated) {
      throw new NotFoundException("Event", id);
    }
  }

  async findBySlug(slug: string): Promise<Event | null> {
    return Event.findOne({ where: { slug } });
  }

  async findPublishedBySlug(slug: string): Promise<Event> {
    const event = await Event.findOne({
      where: { slug, isPublished: true },
    });
    if (!event) {
      throw new NotFoundException("Event", slug);
    }
    return event;
  }

  async list(query: ListQuery): Promise<PaginatedResult<Event>> {
    const where = listSearchWhere(query, ["title", "city", "venue", "summary"]);

    const [count, rows] = await Promise.all([
      Event.count({ where }),
      Event.findAll({
        where,
        attributes: [...EVENT_LIST_ATTRIBUTES],
        offset: query.offset,
        limit: query.limit,
        order: [[query.sort, query.order]],
      }),
    ]);

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async listPublished(limit = 12): Promise<Event[]> {
    return Event.findAll({
      where: { isPublished: true },
      order: [
        ["startsAt", "ASC"],
        ["title", "ASC"],
      ],
      limit,
      attributes: [...EVENT_LIST_ATTRIBUTES, "description"],
    });
  }

  async update(id: string, payload: EventUpdatePayload): Promise<Event> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundException("Event", id);
    }

    await event.update(payload);
    return event;
  }

  async requireId(id: string): Promise<void> {
    const event = await Event.findByPk(id, { attributes: ["id"] });
    if (!event) {
      throw new NotFoundException("Event", id);
    }
  }

  async delete(id: string): Promise<Event> {
    const event = await Event.findByPk(id, {
      attributes: ["id", "title", "slug"],
    });
    if (!event) {
      throw new NotFoundException("Event", id);
    }

    await contentTranslationRepository.deleteFor("event", id);
    await event.destroy();
    return event;
  }
}
