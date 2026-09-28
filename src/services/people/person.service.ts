import type { PersonCategory } from "@/constants/person";
import {
  parseCreatePerson,
  parseUpdatePerson,
  toCreatePersonPayload,
  toUpdatePersonPayload,
  type CreatePerson,
} from "@/data/dtos/person.dto";
import type { Person } from "@/data/entities/person";
import { EmergencyContactRepository } from "@/data/repositories/emergency-contact.repository";
import {
  PersonRepository,
  type PersonUpdatePayload,
} from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ConflictException } from "@/exceptions/conflict.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { ageInYears } from "@/lib/people/age";
import { parsePeopleWorkbook } from "@/lib/people/import-people";
import type { PeopleImportResult } from "@/models/people/people-import.model";
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
    if (input.yfId) {
      const existingYf = await personRepository.findByYfId(input.yfId);
      if (existingYf) {
        throw new ConflictException("A person with this YF ID already exists.");
      }
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
    if (input.yfId) {
      const existingYf = await personRepository.findByYfId(input.yfId);
      if (existingYf && existingYf.id !== id) {
        throw new ConflictException("A person with this YF ID already exists.");
      }
    }

    const before = await personRepository.findById(id);
    const { emergencyContacts, ...fields } = input;
    const payload = toUpdatePersonPayload(fields) as PersonUpdatePayload;
    const birthDate =
      payload.dateOfBirth !== undefined ? payload.dateOfBirth : before.dateOfBirth;
    payload.ageYears = ageInYears(birthDate);
    await personRepository.update(id, payload);

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
    fullName?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await personRepository.findByEmail(email);
    if (existing) {
      return existing;
    }

    const fullName =
      input.fullName?.trim() ||
      [input.firstName, input.lastName].filter(Boolean).join(" ").trim() ||
      email.split("@")[0] ||
      "Guest";

    return personRepository.create(
      toCreatePersonPayload(
        parseCreatePerson({
          email,
          fullName,
        })
      )
    );
  }

  async importFromWorkbook(
    buffer: Buffer,
    category: PersonCategory
  ): Promise<PeopleImportResult> {
    const parsed = parsePeopleWorkbook(buffer, category);
    const errors: PeopleImportResult["errors"] = [];
    let skipped = parsed.skipped;
    const byYfId = new Map<
      string,
      { excelRow: number; person: CreatePerson }
    >();

    for (const row of parsed.rows) {
      if (!row.person) {
        errors.push({
          row: row.excelRow,
          message: row.error ?? "This row is invalid.",
        });
        continue;
      }
      if (!row.person.yfId) {
        skipped += 1;
        errors.push({
          row: row.excelRow,
          message: "YF ID is required so the same file can be imported again safely.",
        });
        continue;
      }
      const previous = byYfId.get(row.person.yfId);
      if (previous) {
        skipped += 1;
      }
      byYfId.set(row.person.yfId, { excelRow: row.excelRow, person: row.person });
    }

    if (byYfId.size === 0) {
      throw new ValidationException(
        "No people with a YF ID were found in this file."
      );
    }

    const existing = await personRepository.findByYfIds(
      Array.from(byYfId.keys())
    );
    const existingByYfId = new Map(
      existing
        .map((person) => [person.yfId ? String(person.yfId) : "", person] as const)
        .filter(([yfId]) => yfId)
    );

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const [yfId, row] of Array.from(byYfId.entries())) {
      try {
        const current = existingByYfId.get(yfId) ?? null;
        const result = await this.upsertImportedPerson(row.person, current);
        if (result === "created") {
          created += 1;
        } else if (result === "updated") {
          updated += 1;
        } else {
          unchanged += 1;
        }
      } catch (error) {
        skipped += 1;
        errors.push({
          row: row.excelRow,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const result: PeopleImportResult = {
      created,
      updated,
      unchanged,
      skipped,
      errors: errors.slice(0, 20),
    };

    await auditService.record({
      action: "import",
      entity: "Person",
      entityId: null,
      after: { category, ...result },
    });

    return result;
  }

  private async upsertImportedPerson(
    input: CreatePerson,
    existing: Person | null
  ): Promise<"created" | "updated" | "unchanged"> {
    if (existing) {
      if (importMatchesPerson(existing, input)) {
        return "unchanged";
      }
      await personRepository.update(
        existing.id,
        toUpdatePersonPayload(input) as PersonUpdatePayload
      );
      return "updated";
    }

    try {
      await personRepository.create(toCreatePersonPayload(input));
      return "created";
    } catch (error) {
      if (!isUniqueConstraintError(error) || !input.yfId) {
        throw error;
      }
      const raced = await personRepository.findByYfId(input.yfId);
      if (!raced) {
        throw error;
      }
      if (importMatchesPerson(raced, input)) {
        return "unchanged";
      }
      await personRepository.update(
        raced.id,
        toUpdatePersonPayload(input) as PersonUpdatePayload
      );
      return "updated";
    }
  }
}

function stamp(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  return String(value).trim();
}

function importMatchesPerson(person: Person, input: CreatePerson) {
  const next = toUpdatePersonPayload(input) as Record<string, unknown>;
  return Object.entries(next).every(
    ([field, value]) => stamp(person.get(field as keyof Person)) === stamp(value)
  );
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "SequelizeUniqueConstraintError"
  );
}

export const personService = new PersonService();
