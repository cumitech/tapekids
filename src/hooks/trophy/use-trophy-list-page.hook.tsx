"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";
import { toast } from "sonner";

import type { ResourceHeroStat } from "@/components/portal/resource-hero";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiDownload, apiErrorMessage, apiGet } from "@/lib/client/api";
import { reportFileName } from "@/lib/export/workbook";
import { formatDateTime } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone";
import type { TrophyEntry, TrophyStats } from "@/models/trophy/trophy.model";

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

  const columns = useTrophyColumns(locale);
  const { table } = useCachedTable<TrophyEntry>({
    resource: "trophy",
    columns,
  });

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

function useTrophyColumns(locale: string) {
  const translate = useTranslate();

  return useMemo<ColumnDef<TrophyEntry>[]>(
    () => [
      {
        id: "fullName",
        accessorKey: "fullName",
        header: translate("trophy.fields.fullName"),
      },
      {
        id: "yfId",
        accessorKey: "yfId",
        header: translate("trophy.fields.yfId"),
        cell: ({ row }) => row.original.yfId || "-",
      },
      {
        id: "email",
        accessorKey: "email",
        header: translate("trophy.fields.email"),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: translate("trophy.fields.phone"),
        cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "-",
      },
      {
        id: "event",
        accessorKey: "eventTitle",
        header: translate("trophy.fields.event"),
        cell: ({ row }) => row.original.eventTitle || "-",
      },
      {
        id: "category",
        accessorKey: "category",
        header: translate("trophy.fields.category"),
        cell: ({ row }) => {
          const category = row.original.category;
          return category
            ? translate(`people.categories.${category}`, category)
            : "-";
        },
      },
      {
        id: "sentAt",
        accessorKey: "sentAt",
        header: translate("trophy.fields.sentAt"),
        cell: ({ row }) => formatDateTime(row.original.sentAt, locale) || "-",
      },
      {
        id: "acceptedAt",
        accessorKey: "acceptedAt",
        header: translate("trophy.fields.registeredAt"),
        cell: ({ row }) =>
          formatDateTime(row.original.acceptedAt, locale) || "-",
      },
      {
        id: "status",
        enableSorting: false,
        header: translate("trophy.fields.status"),
        cell: () => (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {translate("trophy.status.registered")}
          </span>
        ),
      },
    ],
    [locale, translate]
  );
}
