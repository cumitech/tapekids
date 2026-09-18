import type { InferCreationAttributes } from "sequelize";

import type { EventMembershipKind } from "@/constants/event-participation";
import { MEMBERSHIP_STATUSES } from "@/constants/event-participation";
import { Event, EventMembership, Person } from "@/data/entities";
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
}
