export type WaitingListEntry = {
  id: string;
  fullName: string;
  yfId?: string | null;
  email: string;
  phone?: string | null;
  details?: { eventId?: string; eventTitle?: string } | string | null;
  status?: "pending" | "approved";
  createdAt?: string;
};
