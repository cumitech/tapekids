import type { InferCreationAttributes, Order } from "sequelize";

import type { EventMembershipKind } from "@/constants/event-participation";
import { MEMBERSHIP_STATUSES } from "@/constants/event-participation";
import { Event, EventMembership, Person } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { nanoid } from "@/lib/api/id";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type EventMembershipCreatePayload =
  InferCreationAttributes<EventMembership>;

export class EventMembershipRepository {
  async create(
    payload: EventMembershipCreatePayload
  ): Promise<EventMembership> {
    return EventMembership.create(payload);
  }

  async findById(id: string): Promise<EventMembership> {
    const membership = await EventMembership.findByPk(id, {
      include: [{ model: Person, as: "person" }],
    });
    if (!membership) {
      throw new NotFoundException("EventMembership", id);
    }
    return membership;
  }

  async findByEventAndPerson(
    eventId: string,
    personId: string,
    kind?: EventMembershipKind
  ): Promise<EventMembership[]> {
    return EventMembership.findAll({
      where: kind ? { eventId, personId, kind } : { eventId, personId },
      include: [{ model: Person, as: "person" }],
    });
  }

  async upsertInvited(
    eventId: string,
    personId: string,
    kind: EventMembershipKind
  ): Promise<EventMembership> {
    const existing = await EventMembership.findOne({
      where: { eventId, personId, kind },
    });

    if (!existing) {
      return EventMembership.create({
        id: nanoid(),
        eventId,
        personId,
        kind,
        status: MEMBERSHIP_STATUSES.INVITED,
      });
    }

    if (existing.status === MEMBERSHIP_STATUSES.REGISTERED) {
      return existing;
    }

    await existing.update({ status: MEMBERSHIP_STATUSES.INVITED });
    return existing;
  }

  async markRegistered(id: string): Promise<EventMembership> {
    const membership = await EventMembership.findByPk(id);
    if (!membership) {
      throw new NotFoundException("EventMembership", id);
    }
    await membership.update({ status: MEMBERSHIP_STATUSES.REGISTERED });
    return this.findById(id);
  }

  async listByPerson(personId: string): Promise<EventMembership[]> {
    return EventMembership.findAll({
      where: { personId },
      include: [{ model: Event, as: "event" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async listByEvent(eventId: string): Promise<EventMembership[]> {
    return EventMembership.findAll({
      where: { eventId },
      include: [{ model: Person, as: "person" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async listByKind(
    kind: EventMembershipKind,
    query: ListQuery
  ): Promise<PaginatedResult<EventMembership>> {
    const personWhere = listSearchWhere(
      { ...query, eq: undefined, likes: undefined },
      ["email", "fullName", "phone", "yfId"]
    );

    const { rows, count } = await EventMembership.findAndCountAll({
      where: { kind },
      include: [
        {
          model: Person,
          as: "person",
          required: Boolean(query.q),
          where: personWhere,
        },
        { model: Event, as: "event" },
      ],
      offset: query.offset,
      limit: query.limit,
      order: membershipListOrder(query),
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }
}

function membershipListOrder(query: ListQuery): Order {
  const sort = query.sort;
  if (sort === "fullName" || sort === "email" || sort === "yfId") {
    return [[{ model: Person, as: "person" }, sort, query.order]];
  }
  if (sort === "title") {
    return [[{ model: Event, as: "event" }, "title", query.order]];
  }
  return [["createdAt", query.order]];
}
