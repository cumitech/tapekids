import type { InferCreationAttributes } from "sequelize";

import type { InvitationBatchStatus } from "@/constants/event-participation";
import { Event, InvitationBatch, MailingList, User } from "@/data/entities";
import { INVITATION_BATCH_LIST_ATTRIBUTES } from "@/data/query-shape";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type InvitationBatchCreatePayload =
  InferCreationAttributes<InvitationBatch>;

export class InvitationBatchRepository {
  async create(payload: InvitationBatchCreatePayload): Promise<InvitationBatch> {
    return InvitationBatch.create(payload);
  }

  async findById(id: string): Promise<InvitationBatch> {
    const batch = await InvitationBatch.findByPk(id, {
      include: [
        { model: MailingList, as: "mailingList" },
        {
          model: User,
          as: "sentBy",
          attributes: ["id", "email", "username", "role"],
        },
      ],
    });
    if (!batch) {
      throw new NotFoundException("InvitationBatch", id);
    }
    return batch;
  }

  async listByEvent(
    eventId: string,
    query: ListQuery
  ): Promise<PaginatedResult<InvitationBatch>> {
    const [count, rows] = await Promise.all([
      InvitationBatch.count({ where: { eventId } }),
      InvitationBatch.findAll({
        where: { eventId },
        attributes: [...INVITATION_BATCH_LIST_ATTRIBUTES],
        offset: query.offset,
        limit: query.limit,
        order: [[query.sort, query.order]],
      }),
    ]);

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async listByMailingList(mailingListId: string): Promise<InvitationBatch[]> {
    return InvitationBatch.findAll({
      where: { mailingListId },
      attributes: [...INVITATION_BATCH_LIST_ATTRIBUTES],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
  }

  async listForSettings(): Promise<InvitationBatch[]> {
    return InvitationBatch.findAll({
      attributes: [...INVITATION_BATCH_LIST_ATTRIBUTES],
      include: [{ model: Event, as: "event", attributes: ["id", "title"] }],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
  }

  async setLinksOpen(id: string, linksOpen: boolean): Promise<InvitationBatch> {
    const batch = await InvitationBatch.findByPk(id);
    if (!batch) {
      throw new NotFoundException("InvitationBatch", id);
    }
    await batch.update({ linksOpen });
    return this.findById(id);
  }

  async updateStatus(
    id: string,
    status: InvitationBatchStatus,
    sentAt?: Date | null
  ): Promise<InvitationBatch> {
    const batch = await InvitationBatch.findByPk(id);
    if (!batch) {
      throw new NotFoundException("InvitationBatch", id);
    }
    await batch.update({ status, ...(sentAt !== undefined ? { sentAt } : {}) });
    return this.findById(id);
  }
}
