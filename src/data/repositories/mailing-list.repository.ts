import type { InferCreationAttributes } from "sequelize";

import { MailingList, MailingListMember, Person, User } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import {
  PERSON_LIST_ATTRIBUTES,
  personIdsWithInvitations,
  withInvitationFlag,
} from "@/data/query-shape";
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
  include: [
    {
      model: Person,
      as: "person",
      attributes: [...PERSON_LIST_ATTRIBUTES],
    },
  ],
};

export class MailingListRepository {
  async create(payload: MailingListCreatePayload): Promise<MailingList> {
    return MailingList.create(payload);
  }

  async requireId(id: string): Promise<void> {
    const list = await MailingList.findByPk(id, { attributes: ["id"] });
    if (!list) {
      throw new NotFoundException("MailingList", id);
    }
  }

  async findById(
    id: string,
    options?: { members?: boolean }
  ): Promise<MailingList> {
    const withMembers = options?.members !== false;
    const list = await MailingList.findByPk(id, {
      include: withMembers
        ? [
            memberInclude,
            {
              model: User,
              as: "createdBy",
              attributes: ["id", "email", "username", "role"],
            },
          ]
        : [
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
    if (!withMembers) {
      return list;
    }
    const plain = list.toJSON() as MailingList & {
      members?: Array<{ personId: string; person?: { id: string } }>;
    };
    const personIds = (plain.members ?? [])
      .map((member) => member.person?.id ?? member.personId)
      .filter(Boolean);
    const invited = await personIdsWithInvitations(personIds);
    for (const member of plain.members ?? []) {
      if (member.person) {
        member.person = withInvitationFlag(member.person, invited);
      }
    }
    return plain as MailingList;
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
    return list;
  }

  async delete(id: string): Promise<MailingList> {
    const list = await MailingList.findByPk(id);
    if (!list) {
      throw new NotFoundException("MailingList", id);
    }
    await contentTranslationRepository.deleteFor("mailing_list", id);
    await list.destroy();
    return list;
  }
}
