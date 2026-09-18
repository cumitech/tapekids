import type { InferCreationAttributes } from "sequelize";

import { MailingListMember, Person } from "@/data/entities";
import { NotFoundException } from "@/exceptions/not-found.exception";
import { nanoid } from "@/lib/api/id";

export type MailingListMemberCreatePayload =
  InferCreationAttributes<MailingListMember>;

export class MailingListMemberRepository {
  async replaceForList(
    mailingListId: string,
    personIds: string[]
  ): Promise<void> {
    const uniqueIds = Array.from(new Set(personIds));
    await MailingListMember.destroy({ where: { mailingListId } });
    if (uniqueIds.length === 0) {
      return;
    }
    await MailingListMember.bulkCreate(
      uniqueIds.map((personId) => ({
        id: nanoid(),
        mailingListId,
        personId,
      }))
    );
  }

  async add(payload: MailingListMemberCreatePayload): Promise<MailingListMember> {
    const existing = await MailingListMember.findOne({
      where: {
        mailingListId: payload.mailingListId,
        personId: payload.personId,
      },
    });
    if (existing) {
      return existing;
    }
    return MailingListMember.create(payload);
  }

  async findById(id: string): Promise<MailingListMember> {
    const member = await MailingListMember.findByPk(id, {
      include: [{ model: Person, as: "person" }],
    });
    if (!member) {
      throw new NotFoundException("MailingListMember", id);
    }
    return member;
  }

  async listByList(mailingListId: string): Promise<MailingListMember[]> {
    return MailingListMember.findAll({
      where: { mailingListId },
      include: [{ model: Person, as: "person" }],
      order: [["createdAt", "ASC"]],
    });
  }

  async listPersonIds(mailingListId: string): Promise<string[]> {
    const members = await MailingListMember.findAll({
      where: { mailingListId },
      attributes: ["personId"],
    });
    return members.map((member) => member.personId);
  }

  async remove(mailingListId: string, personId: string): Promise<void> {
    const member = await MailingListMember.findOne({
      where: { mailingListId, personId },
    });
    if (!member) {
      throw new NotFoundException("MailingListMember", `${mailingListId}:${personId}`);
    }
    await member.destroy();
  }
}
