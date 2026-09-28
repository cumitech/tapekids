import { WAITING_LIST_STATUS } from "@/data/entities/waiting-list";
import {
  parseApproveWaitingList,
  parseRegisterWaitingList,
} from "@/data/dtos/waiting-list.dto";
import {
  parseCreatePerson,
  toCreatePersonPayload,
} from "@/data/dtos/person.dto";
import { EmergencyContact, Person } from "@/data/entities";
import { WaitingListRepository } from "@/data/repositories/waiting-list.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { sequelize } from "@/database/db-sequelize.config";
import { ConflictException } from "@/exceptions/conflict.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { isPersonProfileComplete } from "@/lib/people/profile-completeness";
import { normalizeStoredPhone } from "@/lib/phone";
import { auditService } from "@/services/audit/audit.service";

const waitingListRepository = new WaitingListRepository();
const personRepository = new PersonRepository();

export class WaitingListService {
  list(query: ListQuery) {
    return waitingListRepository.listPending(query);
  }

  async register(body: unknown) {
    const input = parseRegisterWaitingList({
      ...(body && typeof body === "object" ? body : {}),
      isTrophy: false,
      category: null,
    });
    if (!isPersonProfileComplete(input)) {
      throw new ValidationException(
        "Submit every required detail before joining the waiting list."
      );
    }
    const email = input.email;
    const existingEntry = await waitingListRepository.findByEmail(email);
    if (existingEntry) {
      throw new ConflictException(
        existingEntry.status === WAITING_LIST_STATUS.APPROVED
          ? "This email is already in the directory."
          : "This email is already on the waiting list."
      );
    }

    const existingPerson = await personRepository.findByEmail(email);
    if (existingPerson) {
      throw new ConflictException("This email is already in the directory.");
    }

    if (input.yfId) {
      const existingYf = await personRepository.findByYfId(input.yfId);
      if (existingYf) {
        throw new ConflictException(
          "This Young Foundations ID already belongs to someone in the directory."
        );
      }
    }

    try {
      return await waitingListRepository.create({
        id: nanoid(),
        fullName: input.fullName,
        email,
        phone: normalizeStoredPhone(input.phone),
        details: input as unknown as Record<string, unknown>,
        status: WAITING_LIST_STATUS.PENDING,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException("This email is already on the waiting list.");
      }
      throw error;
    }
  }

  async approve(body: unknown) {
    const ids = Array.from(new Set(parseApproveWaitingList(body)));
    let approved = 0;
    let firstError: unknown;

    for (const id of ids) {
      try {
        await this.approveOne(id);
        approved += 1;
      } catch (error) {
        firstError ??= error;
      }
    }

    if (approved === 0) {
      throw firstError instanceof Error
        ? firstError
        : new ValidationException("Select someone on the waiting list.");
    }

    return { approved, failed: ids.length - approved };
  }

  private async approveOne(id: string) {
    const person = await sequelize.transaction(async (transaction) => {
      const entry = await waitingListRepository.findById(id, transaction);
      if (!entry || entry.status !== WAITING_LIST_STATUS.PENDING) {
        throw new ValidationException("This registration is no longer waiting.");
      }

      const existingPerson = await personRepository.findByEmail(entry.email);
      if (existingPerson) {
        throw new ConflictException("This email is already in the directory.");
      }

      const input = parseCreatePerson({
        ...storedDetails(entry.details),
        fullName: entry.fullName,
        email: entry.email,
        phone: entry.phone,
        isTrophy: false,
        category: null,
      });
      const created = await Person.create(toCreatePersonPayload(input), {
        transaction,
      });
      if (input.emergencyContacts?.length) {
        await EmergencyContact.bulkCreate(
          input.emergencyContacts.map((contact) => ({
            id: nanoid(),
            personId: created.id,
            ...contact,
          })),
          { transaction }
        );
      }

      const marked = await waitingListRepository.markApproved(
        entry.id,
        created.id,
        transaction
      );
      if (!marked) {
        throw new ValidationException("This registration is no longer waiting.");
      }

      return created;
    });

    await auditService.record({
      action: "create",
      entity: "Person",
      entityId: person.id,
      after: person,
    });
  }
}

function storedDetails(value: unknown): Record<string, unknown> {
  if (!value) {
    return {};
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "SequelizeUniqueConstraintError"
  );
}

export const waitingListService = new WaitingListService();
