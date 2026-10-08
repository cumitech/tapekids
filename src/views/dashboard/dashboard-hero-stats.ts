import { formatMoney } from "@/lib/format";
import type { DashboardStats } from "@/models/dashboard/dashboard-stats.model";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function opsHeroStats(translate: Translate, stats: DashboardStats) {
  return [
    {
      label: translate("dashboard.statTrophies"),
      shortLabel: translate("dashboard.statTrophiesShort"),
      value: stats.trophies,
    },
    {
      label: translate("dashboard.statInvitationsSent"),
      shortLabel: translate("dashboard.statInvitationsSentShort"),
      value: stats.invitationsSent,
    },
    {
      label: translate("dashboard.statAmountCollected"),
      shortLabel: translate("dashboard.statAmountCollectedShort"),
      value: formatMoney(stats.amountCollected),
    },
    {
      label: translate("dashboard.statTotalEvents"),
      shortLabel: translate("dashboard.statEvents"),
      value: stats.totalEvents,
    },
  ];
}
