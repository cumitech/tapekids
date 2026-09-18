import type { InferCreationAttributes } from "sequelize";

import { EmergencyContact, Person } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type PersonCreatePayload = InferCreationAttributes<Person>;
export type PersonUpdatePayload = Partial<
  Omit<PersonCreatePayload, "id">
>;

export class PersonRepository {
  async create(payload: PersonCreatePayload): Promise<Person> {
    return Person.create(payload);
  }

  async findById(id: string): Promise<Person> {
    const person = await Person.findByPk(id, {
      include: [{ model: EmergencyContact, as: "emergencyContacts" }],
    });
    if (!person) {
      throw new NotFoundException("Person", id);
    }
    return person;
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
      "firstName",
      "lastName",
      "phone",
      "churchName",
      "town",
      "region",
      "division",
      "subDivision",
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

    const { rows, count } = await Person.findAndCountAll({
      where,
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

  async update(id: string, payload: PersonUpdatePayload): Promise<Person> {
    const person = await Person.findByPk(id);
    if (!person) {
      throw new NotFoundException("Person", id);
    }
    await person.update(payload);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const person = await Person.findByPk(id);
    if (!person) {
      throw new NotFoundException("Person", id);
    }
    await person.destroy();
  }
}
