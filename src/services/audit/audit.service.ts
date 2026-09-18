import { nanoid } from "@/lib/api/id";
import { getRequestContext } from "@/lib/api/request-context";
import { diffChanges, snapshot } from "@/lib/audit/changes";
import { logger } from "@/lib/logger";
import { AuditLogRepository } from "@/data/repositories/audit-log.repository";
import type { ListQuery } from "@/data/types/pagination";

const auditLogRepository = new AuditLogRepository();

export type AuditInput = {
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
};

export class AuditService {
  list(query: ListQuery) {
    return auditLogRepository.list(query);
  }

  async record(input: AuditInput): Promise<void> {
    try {
      const context = getRequestContext();
      const before = snapshot(input.before);
      const after = snapshot(input.after);
      const changes =
        input.before !== undefined || input.after !== undefined
          ? (diffChanges(before, after) as Record<string, unknown>)
          : null;

      await auditLogRepository.create({
        id: nanoid(),
        actorId: context?.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        changes,
        metadata: context
          ? {
              requestId: context.requestId,
              method: context.method,
              path: context.path,
              ip: context.ip,
            }
          : null,
      });
    } catch (error) {
      logger.error("audit.write_failed", {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const auditService = new AuditService();
