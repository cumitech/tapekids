export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  actor?: { email?: string; username?: string };
  changes?: Record<string, unknown> | null;
}
