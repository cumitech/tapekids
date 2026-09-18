import type { InferCreationAttributes } from "sequelize";

import { MailingList, MailingListMember, Person, User } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type MailingListCreatePayload = InferCreationAttributes<MailingList>;
export type MailingListUpdatePayload = Partial<
  Omit<MailingListCreatePayload, "id" | "createdById">
>;

const memberInclude = {
  model: MailingListMember,
  as: "members",
  include: [{ model: Person, as: "person" }],
};

export class MailingListRepository {
  async create(payload: MailingListCreatePayload): Promise<MailingList> {
    return MailingList.create(payload);
  }

  async findById(id: string): Promise<MailingList> {
    const list = await MailingList.findByPk(id, {
      include: [
        memberInclude,
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "email", "username", "role"],
        },
      ],
    });
    if (!list) {
      throw new NotFoundException("MailingList", id);
    }
    return list;
  }

  async list(query: ListQuery): Promise<PaginatedResult<MailingList>> {
    const where = listSearchWhere(query, ["name", "description"]);
    const { rows, count } = await MailingList.findAndCountAll({
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

  async update(id: string, payload: MailingListUpdatePayload): Promise<MailingList> {
    const list = await MailingList.findByPk(id);
    if (!list) {
      throw new NotFoundException("MailingList", id);
    }
    await list.update(payload);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const list = await MailingList.findByPk(id);
    if (!list) {
      throw new NotFoundException("MailingList", id);
    }
    await contentTranslationRepository.deleteFor("mailing_list", id);
    await list.destroy();
  }
}
