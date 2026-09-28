export type DashboardStats = {
  trophyCampers: number;
  trophyParticipants: number;
  invitationsSent: number;
  amountCollected: number;
  totalEvents: number;
  invitationLinksOpen: boolean;
};

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  trophyCampers: 0,
  trophyParticipants: 0,
  invitationsSent: 0,
  amountCollected: 0,
  totalEvents: 0,
  invitationLinksOpen: true,
};
