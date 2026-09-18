import type { InferCreationAttributes } from "sequelize";

import type { InvitationBatchStatus } from "@/constants/event-participation";
import { InvitationBatch, MailingList, User } from "@/data/entities";
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
    const { rows, count } = await InvitationBatch.findAndCountAll({
      where: { eventId },
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
