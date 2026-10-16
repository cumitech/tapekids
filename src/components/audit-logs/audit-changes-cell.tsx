"use client";

import { useTranslate } from "@refinedev/core";

import { useAppModal } from "@/components/shared/modals/app-modal";
import { Button } from "@/components/shared/ui/button";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatPresentedValue } from "@/lib/format";
import type { AuditLog } from "@/models/audit-logs/audit-log.model";

export function AuditChangesCell({ record }: { record: AuditLog }) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const { openModal } = useAppModal();
  const changes = record.changes;
  const hasChanges = Boolean(
    changes && typeof changes === "object" && Object.keys(changes).length > 0
  );

  if (!hasChanges) {
    return (
      <span className="text-sm text-muted-foreground">
        {translate("auditLogs.noChanges")}
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() =>
        openModal({
          title: translate("auditLogs.viewChanges"),
          className: "sm:max-w-2xl",
          body: (
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(formatPresentedValue(changes, locale), null, 2)}
            </pre>
          ),
        })
      }
    >
      {translate("auditLogs.viewChanges")}
    </Button>
  );
}
