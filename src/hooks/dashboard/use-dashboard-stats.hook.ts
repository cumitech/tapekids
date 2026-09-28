"use client";

import { useCallback, useEffect, useState } from "react";

import { apiGet } from "@/lib/client/api";
import {
  EMPTY_DASHBOARD_STATS,
  type DashboardStats,
} from "@/models/dashboard/dashboard-stats.model";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_DASHBOARD_STATS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await apiGet<DashboardStats>("/dashboard/stats");
    setStats(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void refresh()
      .catch(() => {
        if (!cancelled) {
          setStats(EMPTY_DASHBOARD_STATS);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return { stats, loading, refresh };
}
