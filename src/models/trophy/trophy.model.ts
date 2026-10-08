import type { BaseRecord } from "@refinedev/core";

export type TrophyEntry = BaseRecord & {
  id: string;
  personId: string;
  eventId: string;
  batchId?: string | null;
  fullName: string;
  yfId: string | null;
  email: string;
  phone: string | null;
  category: string | null;
  eventTitle: string;
  sentAt?: string | null;
  acceptedAt?: string | null;
  status: string;
};

export type TrophyStats = {
  registered: number;
  invitationsSent: number;
  uniquePeople: number;
  responseRate: string;
};
