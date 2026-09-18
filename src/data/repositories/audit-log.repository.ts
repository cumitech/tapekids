import { AuditLog, User } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";

export class AuditLogRepository {
  async create(payload: {
    id: string;
    actorId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    changes?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<AuditLog> {
    return AuditLog.create(payload);
  }

  async list(query: ListQuery): Promise<PaginatedResult<AuditLog>> {
    const where = listSearchWhere(query, ["action", "entity"]);
    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "email", "username", "role"],
        },
      ],
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
}
