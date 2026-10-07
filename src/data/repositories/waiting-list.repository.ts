import {
  col,
  fn,
  Op,
  where,
  type Transaction,
  type WhereOptions,
} from "sequelize";

import { WAITING_LIST_STATUS, WaitingListEntry } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { normalizeYfId } from "@/lib/people/yf-id";

const JOIN_REGISTRATION_SORT = new Set([
  "createdAt",
  "fullName",
  "email",
  "phone",
  "yfId",
  "status",
]);

export class WaitingListRepository {
  create(payload: {
    id: string;
    fullName: string;
    email: string;
    yfId?: string | null;
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

  findByYfId(yfId: string) {
    const normalized = normalizeYfId(yfId);
    if (!normalized) {
      return Promise.resolve(null);
    }
    return WaitingListEntry.findOne({ where: { yfId: normalized } });
  }

  async listPending(query: ListQuery): Promise<PaginatedResult<WaitingListEntry>> {
    const search = listSearchWhere(query, ["fullName", "email", "phone", "yfId"]);
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

  async listJoinRegistrations(
    query: ListQuery
  ): Promise<PaginatedResult<WaitingListEntry>> {
    const search = listSearchWhere(query, ["fullName", "email", "phone", "yfId"]);
    const linked: WhereOptions = {
      [Op.and]: [
        where(joinEventId(), { [Op.not]: null }),
        where(fn("CHAR_LENGTH", joinEventId()), { [Op.gt]: 0 }),
      ],
    };
    const rowWhere: WhereOptions = search
      ? { [Op.and]: [linked, search] }
      : linked;
    const sort = JOIN_REGISTRATION_SORT.has(query.sort) ? query.sort : "createdAt";

    const { rows, count } = await WaitingListEntry.findAndCountAll({
      where: rowWhere,
      offset: query.offset,
      limit: query.limit,
      order: [[sort, query.order]],
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

function joinEventId() {
  return fn("JSON_UNQUOTE", fn("JSON_EXTRACT", col("details"), "$.eventId"));
}
