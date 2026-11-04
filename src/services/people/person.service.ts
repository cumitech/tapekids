import {
  PERSON_CATEGORY_VALUES,
  type PersonCategory,
} from "@/constants/person";
import { parseInviteYfId } from "@/data/dtos/invitation.dto";
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
import { PeopleImportBatchRepository } from "@/data/repositories/people-import-batch.repository";
import { UserRepository } from "@/data/repositories/user.repository";
import type { ListQuery } from "@/data/types/pagination";
import { ConflictException } from "@/exceptions/conflict.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { ageInYears } from "@/lib/people/age";
import type { AppLocale } from "@/constants/locales";
import { formatDateTime, formatImportBatchLabel } from "@/lib/format";
import { parsePeopleWorkbook } from "@/lib/people/import-people";
import type {
  ImportBatchInfo,
  PeopleImportHistoryItem,
  PeopleImportResult,
} from "@/models/people/people-import.model";
import { auditService } from "@/services/audit/audit.service";
import { invitationService } from "@/services/invitations/invitation.service";

const personRepository = new PersonRepository();
const emergencyContactRepository = new EmergencyContactRepository();
const userRepository = new UserRepository();
const peopleImportBatchRepository = new PeopleImportBatchRepository();

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
      await assertYfIdAvailable(input.yfId, id);
    }

    const before = await personRepository.findById(id);
    const { emergencyContacts, ...fields } = input;
    const payload = toUpdatePersonPayload(fields) as PersonUpdatePayload;
    if (payload.ageYears === undefined) {
      const birthDate =
        payload.dateOfBirth !== undefined ? payload.dateOfBirth : before.dateOfBirth;
      payload.ageYears = ageInYears(birthDate);
    }
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

    if (input.yfId !== undefined) {
      await syncLinkedUserYfId(id, input.yfId ?? null);
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

  async assignYfId(id: string, body: unknown) {
    const { yfId } = parseInviteYfId(body);
    await assertYfIdAvailable(yfId, id);
    const before = await personRepository.findById(id, {
      emergencyContacts: false,
    });
    await personRepository.update(id, { yfId });
    const person = await personRepository.findById(id, {
      emergencyContacts: false,
    });
    const acceptedCount = await invitationService.acceptDeliveredYfInvites(person);
    await syncLinkedUserYfId(id, yfId);
    const after = person;
    await auditService.record({
      action: "update",
      entity: "Person",
      entityId: id,
      before,
      after,
    });
    return { person: after, acceptedCount };
  }

  async delete(id: string) {
    const before = await personRepository.findById(id, {
      emergencyContacts: false,
    });
    await personRepository.delete(id);
    await auditService.record({
      action: "delete",
      entity: "Person",
      entityId: id,
      before,
    });
  }

  async summary() {
    const rows = await personRepository.countByCategory();
    const counts = new Map(rows.map((row) => [row.category ?? "", row.count]));
    return PERSON_CATEGORY_VALUES.map((category) => ({
      category,
      count: counts.get(category) ?? 0,
    }));
  }

  async deleteMany(input: {
    category: PersonCategory;
    ids?: string[];
    all?: boolean;
  }) {
    if (!input.all && (!input.ids || input.ids.length === 0)) {
      throw new ValidationException("Choose people to delete.");
    }
    if (input.ids && input.ids.length > 5000) {
      throw new ValidationException("Too many people were selected at once.");
    }

    const deleted = await personRepository.deleteInCategory(
      input.category,
      input.all ? undefined : input.ids
    );
    await auditService.record({
      action: "delete",
      entity: "Person",
      entityId: null,
      after: {
        category: input.category,
        deleted,
        all: Boolean(input.all),
      },
    });
    return { deleted };
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
  ): Promise<{ result: PeopleImportResult; newPersonIds: string[] }> {
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
    const newPersonIds: string[] = [];
    const importedAt = new Date();
    importedAt.setMilliseconds(0);

    for (const [yfId, row] of Array.from(byYfId.entries())) {
      try {
        const current = existingByYfId.get(yfId) ?? null;
        const upsertResult = await this.upsertImportedPerson(
          row.person,
          current,
          importedAt
        );
        if (upsertResult.status === "created") {
          created += 1;
          newPersonIds.push(upsertResult.personId);
        } else if (upsertResult.status === "updated") {
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
      importedAt: importedAt.toISOString(),
      errors: errors.slice(0, 20),
    };

    await auditService.record({
      action: "import",
      entity: "Person",
      entityId: null,
      after: { category, ...result },
    });

    return { result, newPersonIds };
  }

  async listImportBatches(
    category?: PersonCategory,
    locale?: AppLocale
  ): Promise<ImportBatchInfo[]> {
    const rows = await personRepository.listImportBatches(category);

    return rows.map((row) => ({
      importedAt: row.importedAt.toISOString(),
      category: row.category,
      count: row.count,
      label: formatImportBatchLabel(row.importedAt, locale),
    }));
  }

  async recordImportHistory(input: {
    category: PersonCategory;
    importedAt: string;
    fileName: string;
    result: PeopleImportResult;
    mailingListId: string | null;
  }) {
    const now = new Date();
    const batch = await peopleImportBatchRepository.create({
      id: nanoid(),
      category: input.category,
      importedAt: new Date(input.importedAt),
      fileName: input.fileName.slice(0, 255),
      created: input.result.created,
      updated: input.result.updated,
      unchanged: input.result.unchanged,
      skipped: input.result.skipped,
      mailingListId: input.mailingListId,
      createdAt: now,
      updatedAt: now,
    });
    return batch.id;
  }

  attachImportMailingList(batchId: string, mailingListId: string) {
    return peopleImportBatchRepository.attachMailingList(batchId, mailingListId);
  }

  async listImportHistory(
    category?: PersonCategory
  ): Promise<PeopleImportHistoryItem[]> {
    const [batches, legacyBatches] = await Promise.all([
      peopleImportBatchRepository.list(category),
      personRepository.listImportBatches(category),
    ]);
    const recordedKeys = new Set(
      batches.map(
        (batch) =>
          `${batch.category}:${new Date(batch.importedAt).toISOString()}`
      )
    );
    const recorded = batches.map((batch) => {
      const record = batch.toJSON();
      const mailingList = batch.mailingList;
      return {
        id: record.id,
        importedAt: record.importedAt.toISOString(),
        category: record.category,
        fileName: record.fileName,
        created: record.created,
        updated: record.updated,
        unchanged: record.unchanged,
        skipped: record.skipped,
        totalProcessed:
          record.created + record.updated + record.unchanged + record.skipped,
        mailingList: mailingList
          ? {
              id: mailingList.id,
              name: mailingList.name,
            }
          : null,
        recorded: true,
      };
    });
    const legacy = legacyBatches
      .filter(
        (batch) =>
          !recordedKeys.has(
            `${batch.category}:${batch.importedAt.toISOString()}`
          )
      )
      .map((batch) => ({
        id: `legacy-${batch.category ?? "unknown"}-${batch.importedAt.getTime()}`,
        importedAt: batch.importedAt.toISOString(),
        category: batch.category ?? "",
        fileName: "",
        created: null,
        updated: null,
        unchanged: null,
        skipped: null,
        totalProcessed: batch.count,
        mailingList: null,
        recorded: false,
      }));
    return [...recorded, ...legacy].sort(
      (a, b) =>
        new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
    );
  }

  private async upsertImportedPerson(
    input: CreatePerson,
    existing: Person | null,
    importedAt: Date
  ): Promise<{
    status: "created" | "updated" | "unchanged";
    personId: string;
  }> {
    const resolvedImportedAt = existing?.importedAt ?? importedAt;
    const inputWithImport: CreatePerson = {
      ...input,
      importedAt: resolvedImportedAt,
    };
    if (existing) {
      const matches = importMatchesPerson(existing, input);
      await personRepository.update(
        existing.id,
        toUpdatePersonPayload(inputWithImport) as PersonUpdatePayload
      );
      return {
        status: matches ? "unchanged" : "updated",
        personId: existing.id,
      };
    }

    try {
      const created = await personRepository.create(
        toCreatePersonPayload(inputWithImport)
      );
      return { status: "created", personId: created.id };
    } catch (error) {
      if (!isUniqueConstraintError(error) || !input.yfId) {
        throw error;
      }
      const raced = await personRepository.findByYfId(input.yfId);
      if (!raced) {
        throw error;
      }
      const racedImportedAt = raced.importedAt ?? importedAt;
      const racedInputWithImport: CreatePerson = {
        ...input,
        importedAt: racedImportedAt,
      };
      const matches = importMatchesPerson(raced, input);
      await personRepository.update(
        raced.id,
        toUpdatePersonPayload(racedInputWithImport) as PersonUpdatePayload
      );
      return {
        status: matches ? "unchanged" : "updated",
        personId: raced.id,
      };
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

async function assertYfIdAvailable(yfId: string, personId: string) {
  const existingYf = await personRepository.findByYfId(yfId);
  if (existingYf && existingYf.id !== personId) {
    throw new ConflictException("A person with this YF ID already exists.");
  }
  const linked = await userRepository.findByPersonId(personId);
  const taken = await userRepository.findByYfId(yfId);
  if (taken && taken.id !== linked?.id && (taken.personId || linked)) {
    throw new ConflictException(
      "This Young Foundations ID is already used by another account."
    );
  }
}

async function syncLinkedUserYfId(personId: string, yfId: string | null) {
  const linked = await userRepository.findByPersonId(personId);
  const next = yfId || null;
  if (!linked || (linked.yfId ?? null) === next) {
    return;
  }
  if (next) {
    const taken = await userRepository.findByYfId(next);
    if (taken && taken.id !== linked.id) {
      throw new ConflictException(
        "This Young Foundations ID is already used by another account."
      );
    }
  }
  await userRepository.setYfId(linked.id, next);
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
