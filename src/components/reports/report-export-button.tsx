"use client";

import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/shared/ui/button";
import type { ReportKind } from "@/constants/reports";
import { apiDownload } from "@/lib/client/api";
import { reportFileName } from "@/lib/export/workbook";

type ReportExportButtonProps = {
  kind: ReportKind;
};

export function ReportExportButton({ kind }: ReportExportButtonProps) {
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);

  async function onExport() {
    setBusy(true);
    try {
      await apiDownload(
        `/reports/${kind}/export`,
        reportFileName(kind)
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : translate("reports.exportFailed")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={onExport} disabled={busy}>
      <Download className="mr-2 h-4 w-4" />
      {busy ? translate("reports.exporting") : translate("buttons.export")}
    </Button>
  );
}
