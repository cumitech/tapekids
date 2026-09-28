export type WaitingListEntry = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  details?: { eventTitle?: string } | string | null;
  createdAt?: string;
};
