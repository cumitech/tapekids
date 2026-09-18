import { Event, User } from "@/data/entities";
import type { EventCreatePayload, EventUpdatePayload } from "@/data/dtos/event.dto";
import { listSearchWhere } from "@/data/list-where";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

const createdByInclude = {
  model: User,
  as: "createdBy",
  attributes: ["id", "email", "username", "role"],
  required: false,
};

export class EventRepository {
  async create(payload: EventCreatePayload): Promise<Event> {
    return Event.create(payload);
  }

  async findById(id: string): Promise<Event> {
    const event = await Event.findByPk(id, { include: [createdByInclude] });
    if (!event) {
      throw new NotFoundException("Event", id);
    }
    return event;
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

    const { rows, count } = await Event.findAndCountAll({
      where,
      include: [createdByInclude],
      offset: query.offset,
      limit: query.limit,
      order: [[query.sort, query.order]],
    });

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
      attributes: [
        "id",
        "title",
        "slug",
        "summary",
        "description",
        "venue",
        "city",
        "startsAt",
        "endsAt",
        "imageUrl",
      ],
    });
  }

  async update(id: string, payload: EventUpdatePayload): Promise<Event> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundException("Event", id);
    }

    await event.update(payload);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundException("Event", id);
    }

    await contentTranslationRepository.deleteFor("event", id);
    await event.destroy();
  }
}
