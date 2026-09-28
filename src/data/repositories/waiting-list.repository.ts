import { Op, type Transaction, type WhereOptions } from "sequelize";

import { WAITING_LIST_STATUS, WaitingListEntry } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";

export class WaitingListRepository {
  create(payload: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    details?: Record<string, unknown> | null;
    status: (typeof WAITING_LIST_STATUS)[keyof typeof WAITING_LIST_STATUS];
  }) {
    return WaitingListEntry.create(payload);
  }

  findById(id: string, transaction?: Transaction) {
    return WaitingListEntry.findByPk(id, {
      transaction,
      lock: transaction?.LOCK.UPDATE,
    });
  }

  findByEmail(email: string) {
    return WaitingListEntry.findOne({ where: { email } });
  }

  async listPending(query: ListQuery): Promise<PaginatedResult<WaitingListEntry>> {
    const search = listSearchWhere(query, ["fullName", "email", "phone"]);
    const where: WhereOptions = search
      ? { [Op.and]: [{ status: WAITING_LIST_STATUS.PENDING }, search] }
      : { status: WAITING_LIST_STATUS.PENDING };

    const { rows, count } = await WaitingListEntry.findAndCountAll({
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

  async markApproved(id: string, personId: string, transaction?: Transaction) {
    const [count] = await WaitingListEntry.update(
      { status: WAITING_LIST_STATUS.APPROVED, personId },
      { where: { id, status: WAITING_LIST_STATUS.PENDING }, transaction }
    );
    return count > 0;
  }
}
