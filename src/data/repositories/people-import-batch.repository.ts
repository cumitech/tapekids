import { Op, type InferCreationAttributes } from "sequelize";

import type { PersonCategory } from "@/constants/person";
import { MailingList, PeopleImportBatch } from "@/data/entities";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type PeopleImportBatchCreatePayload =
  InferCreationAttributes<PeopleImportBatch>;

export class PeopleImportBatchRepository {
  create(payload: PeopleImportBatchCreatePayload) {
    return PeopleImportBatch.create(payload);
  }

  async attachMailingList(id: string, mailingListId: string): Promise<void> {
    const batch = await PeopleImportBatch.findByPk(id);
    if (!batch) {
      throw new NotFoundException("PeopleImportBatch", id);
    }
    await batch.update({ mailingListId });
  }

  list(category?: PersonCategory) {
    return PeopleImportBatch.findAll({
      where: category ? { category } : undefined,
      include: [
        {
          model: MailingList,
          as: "mailingList",
          attributes: ["id", "name"],
        },
      ],
      order: [["importedAt", "DESC"]],
      limit: 200,
    });
  }

  async findSameDayCount(category: PersonCategory, importedAt: Date) {
    const dayStart = new Date(importedAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(importedAt);
    dayEnd.setHours(23, 59, 59, 999);

    return PeopleImportBatch.count({
      where: {
        category,
        importedAt: {
          [Op.gte]: dayStart,
          [Op.lte]: dayEnd,
        },
      },
    });
  }
}
