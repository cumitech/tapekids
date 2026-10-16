"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { toast } from "sonner";

import type { ResourceHeroStat } from "@/components/portal/resource-hero";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMembershipReportTable } from "@/hooks/reports/use-report-list.hook";
import { apiDownload, apiErrorMessage, apiGet } from "@/lib/client/api";
import { reportFileName } from "@/lib/export/workbook";
import type { TrophyStats } from "@/models/trophy/trophy.model";

export function useTrophyListPage() {
  const translate = useTranslate();
  const { locale } = useLocale();
  const [stats, setStats] = useState<TrophyStats | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<TrophyStats>("/trophy/stats")
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        // Stats failure should not block rendering
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const heroStats = useMemo<ResourceHeroStat[]>(() => {
    if (!stats) {
      return [
        {
          label: translate("trophy.stats.registered"),
          value: "-",
          accent: "gold",
        },
        {
          label: translate("trophy.stats.invitationsSent"),
          value: "-",
          accent: "glass",
        },
        {
          label: translate("trophy.stats.responseRate"),
          value: "-",
          accent: "glass",
        },
      ];
    }
    return [
      {
        label: translate("trophy.stats.registered"),
        value: stats.registered,
        accent: "gold",
      },
      {
        label: translate("trophy.stats.invitationsSent"),
        value: stats.invitationsSent,
        accent: "glass",
      },
      {
        label: translate("trophy.stats.responseRate"),
        value: stats.responseRate,
        accent: "glass",
      },
    ];
  }, [stats, translate]);

  const { table } = useMembershipReportTable("reports/trophy-participants");

  async function handleExport() {
    setDownloading(true);
    try {
      await apiDownload(
        `/trophy/export?locale=${encodeURIComponent(locale)}`,
        reportFileName("trophy")
      );
      toast.success(translate("trophy.exportSuccess"));
    } catch (error) {
      toast.error(apiErrorMessage(error, translate("trophy.exportFailed")));
    } finally {
      setDownloading(false);
    }
  }

  return { translate, table, heroStats, downloading, handleExport };
}
