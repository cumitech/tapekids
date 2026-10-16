import { Op, fn, col, type Transaction, type WhereOptions } from "sequelize";
import type { InferCreationAttributes } from "sequelize";

import { EmergencyContact, Person } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import {
  PERSON_LIST_ATTRIBUTES,
  personIdsWithInvitations,
  withInvitationFlag,
} from "@/data/query-shape";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";
import type { PersonCategory } from "@/constants/person";
import { normalizeYfId } from "@/lib/people/yf-id";

export type PersonCreatePayload = InferCreationAttributes<Person>;
export type PersonUpdatePayload = Partial<
  Omit<PersonCreatePayload, "id">
>;

export class PersonRepository {
  async create(payload: PersonCreatePayload): Promise<Person> {
    return Person.create(payload);
  }

  async findById(
    id: string,
    options?: { emergencyContacts?: boolean }
  ): Promise<Person> {
    const person = await Person.findByPk(id, {
      include:
        options?.emergencyContacts === false
          ? undefined
          : [{ model: EmergencyContact, as: "emergencyContacts" }],
    });
    if (!person) {
      throw new NotFoundException("Person", id);
    }
    return person;
  }

  async findByYfId(
    yfId: string,
    transaction?: Transaction
  ): Promise<Person | null> {
    const normalized = normalizeYfId(yfId);
    if (!normalized) {
      return null;
    }
    const exact = await Person.findOne({
      where: { yfId: normalized },
      transaction,
    });
    if (exact || normalized === yfId) {
      return exact;
    }
    return Person.findOne({ where: { yfId }, transaction });
  }

  async findByYfIds(yfIds: string[]): Promise<Person[]> {
    const ids = yfIds
      .map((value) => normalizeYfId(value))
      .filter(Boolean);
    if (ids.length === 0) {
      return [];
    }
    return Person.findAll({
      where: { yfId: { [Op.in]: ids } },
    });
  }

  async findByEmail(email: string): Promise<Person | null> {
    return Person.findOne({ where: { email } });
  }

  async findByIds(ids: string[]): Promise<Person[]> {
    if (ids.length === 0) {
      return [];
    }
    return Person.findAll({ where: { id: ids } });
  }

  async search(query: ListQuery): Promise<PaginatedResult<Person>> {
    return this.list(query);
  }

  async list(query: ListQuery): Promise<PaginatedResult<Person>> {
    const where = listSearchWhere(query, [
      "email",
      "fullName",
      "phone",
      "churchName",
      "town",
      "region",
      "division",
      "subDivision",
      "yfId",
    ]);

    if (query.idsOnly) {
      const rows = await Person.findAll({
        where,
        attributes: ["id"],
        order: [[query.sort, query.order]],
      });
      return {
        data: rows,
        total: rows.length,
        offset: 0,
        limit: rows.length,
      };
    }

    const [count, rows] = await Promise.all([
      Person.count({ where }),
      Person.findAll({
        where,
        attributes: [...PERSON_LIST_ATTRIBUTES],
        offset: query.offset,
        limit: query.limit,
        order: [[query.sort, query.order]],
      }),
    ]);
    const invited = await personIdsWithInvitations(rows.map((row) => row.id));

    return {
      data: rows.map((row) =>
        withInvitationFlag(row.toJSON() as { id: string }, invited)
      ) as unknown as Person[],
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async update(id: string, payload: PersonUpdatePayload): Promise<Person> {
    const person = await Person.findByPk(id);
    if (!person) {
      throw new NotFoundException("Person", id);
    }
    await person.update(payload);
    return person;
  }

  async delete(id: string): Promise<void> {
    const deleted = await Person.destroy({ where: { id } });
    if (!deleted) {
      throw new NotFoundException("Person", id);
    }
  }

  async countByCategory(): Promise<Array<{ category: string | null; count: number }>> {
    const rows = await Person.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      group: ["category"],
      raw: true,
    });

    return rows.map((row) => {
      const record = row as unknown as { category: string | null; count: string | number };
      return {
        category: record.category,
        count: Number(record.count) || 0,
      };
    });
  }

  async deleteInCategory(category: PersonCategory, ids?: string[]): Promise<number> {
    const where: WhereOptions = { category };
    if (ids) {
      if (ids.length === 0) {
        return 0;
      }
      Object.assign(where, { id: { [Op.in]: ids } });
    }
    return Person.destroy({ where });
  }

  async listImportBatches(
    category?: PersonCategory
  ): Promise<Array<{ importedAt: Date; category?: string | null; count: number }>> {
    const where: WhereOptions = {
      importedAt: { [Op.not]: null },
    };
    if (category) {
      Object.assign(where, { category });
    }

    const rows = await Person.findAll({
      attributes: [
        "importedAt",
        "category",
        [fn("COUNT", col("id")), "count"],
      ],
      where,
      group: ["importedAt", "category"],
      order: [["importedAt", "DESC"]],
      raw: true,
    });

    return rows.map((row) => {
      const record = row as unknown as {
        importedAt: Date | string;
        category: string | null;
        count: string | number;
      };
      return {
        importedAt: new Date(record.importedAt),
        category: record.category,
        count: Number(record.count) || 0,
      };
    });
  }
}

