export type DashboardStats = {
  trophies: number;
  trophyCampers: number;
  trophyParticipants: number;
  invitationsSent: number;
  amountCollected: number;
  totalEvents: number;
  invitationLinksOpen: boolean;
};

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  trophies: 0,
  trophyCampers: 0,
  trophyParticipants: 0,
  invitationsSent: 0,
  amountCollected: 0,
  totalEvents: 0,
  invitationLinksOpen: true,
};
