import { z } from "zod";

import { EventRepository } from "@/data/repositories/event.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import { NotFoundException } from "@/exceptions/not-found.exception";
import { tokenId } from "@/lib/api/id";
import { requiredYfIdSchema } from "@/lib/people/yf-id";
import { authService } from "@/services/auth/auth.service";

const JOIN_TOKEN = /^[0-9A-Za-z]{48}$/;

const generateSchema = z.object({
  regenerate: z.boolean().optional(),
});

const enterSchema = z.object({
  yfId: requiredYfIdSchema,
});

const eventRepository = new EventRepository();
const personRepository = new PersonRepository();

function publicEvent(event: {
  id: string;
  title: string;
  city: string;
  venue: string;
  startsAt: Date;
  endsAt: Date | null;
}) {
  return {
    eventId: event.id,
    title: event.title,
    city: event.city,
    venue: event.venue,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  };
}

export class EventJoinService {
  async linkFor(eventId: string) {
    const event = await eventRepository.findById(eventId);
    return { token: event.joinToken ?? null };
  }

  async generate(eventId: string, body: unknown) {
    const { regenerate } = generateSchema.parse(body ?? {});
    const event = await eventRepository.findById(eventId);
    if (event.joinToken && !regenerate) {
      return { token: event.joinToken };
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const token = tokenId();
      try {
        await eventRepository.setJoinToken(event.id, token);
        return { token };
      } catch (error) {
        if (!isUniqueConstraintError(error) || attempt === 2) {
          throw error;
        }
      }
    }

    throw new Error("Could not generate a join link.");
  }

  async preview(rawToken: string) {
    return publicEvent(await this.requireEvent(rawToken));
  }

  async enter(rawToken: string, body: unknown) {
    const event = await this.requireEvent(rawToken);
    const { yfId } = enterSchema.parse(body);
    const person = await personRepository.findByYfId(yfId);
    if (!person) {
      return {
        found: false as const,
        event: publicEvent(event),
      };
    }

    const session = await authService.completeGuestInvite(person, {
      verifiedByYfId: true,
    });
    return {
      found: true as const,
      token: session.token,
      user: session.user,
    };
  }

  private async requireEvent(rawToken: string) {
    const token = String(rawToken ?? "").trim();
    if (!JOIN_TOKEN.test(token)) {
      throw new NotFoundException("Join link", "unknown");
    }
    const event = await eventRepository.findByJoinToken(token);
    if (!event) {
      throw new NotFoundException("Join link", "unknown");
    }
    return event;
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "SequelizeUniqueConstraintError"
  );
}

export const eventJoinService = new EventJoinService();
