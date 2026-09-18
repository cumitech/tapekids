import {
  parseCreatePerson,
  parseUpdatePerson,
  toCreatePersonPayload,
  toUpdatePersonPayload,
} from "@/data/dtos/person.dto";
import { EmergencyContactRepository } from "@/data/repositories/emergency-contact.repository";
import {
  PersonRepository,
  type PersonUpdatePayload,
} from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ConflictException } from "@/exceptions/conflict.exception";
import { nanoid } from "@/lib/api/id";
import { auditService } from "@/services/audit/audit.service";

const personRepository = new PersonRepository();
const emergencyContactRepository = new EmergencyContactRepository();

export class PersonService {
  list(query: ListQuery) {
    return personRepository.search(query);
  }

  getById(id: string) {
    return personRepository.findById(id);
  }

  async create(body: unknown) {
    const input = parseCreatePerson(body);
    const existing = await personRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException("A person with this email already exists.");
    }

    const person = await personRepository.create(toCreatePersonPayload(input));
    if (input.emergencyContacts?.length) {
      await emergencyContactRepository.replaceForPerson(
        person.id,
        input.emergencyContacts.map((contact) => ({
          id: nanoid(),
          ...contact,
        }))
      );
    }

    const created = await personRepository.findById(person.id);
    await auditService.record({
      action: "create",
      entity: "Person",
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async update(id: string, body: unknown) {
    const input = parseUpdatePerson(body);
    if (input.email) {
      const existing = await personRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new ConflictException("A person with this email already exists.");
      }
    }

    const before = await personRepository.findById(id);
    const { emergencyContacts, ...fields } = input;
    await personRepository.update(
      id,
      toUpdatePersonPayload(fields) as PersonUpdatePayload
    );

    if (emergencyContacts) {
      await emergencyContactRepository.replaceForPerson(
        id,
        emergencyContacts.map((contact) => ({
          id: nanoid(),
          ...contact,
        }))
      );
    }

    const after = await personRepository.findById(id);
    await auditService.record({
      action: "update",
      entity: "Person",
      entityId: id,
      before,
      after,
    });
    return after;
  }

  async delete(id: string) {
    const before = await personRepository.findById(id);
    await personRepository.delete(id);
    await auditService.record({
      action: "delete",
      entity: "Person",
      entityId: id,
      before,
    });
  }

  async findOrCreateByEmail(input: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await personRepository.findByEmail(email);
    if (existing) {
      return existing;
    }

    const local = email.split("@")[0] || "guest";
    return personRepository.create(
      toCreatePersonPayload(
        parseCreatePerson({
          email,
          firstName: input.firstName?.trim() || local,
          lastName: input.lastName?.trim() || "Unknown",
        })
      )
    );
  }
}

export const personService = new PersonService();
