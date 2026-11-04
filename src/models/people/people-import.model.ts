export type PeopleImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  importedAt?: string;
  mailingList?: {
    id: string;
    name: string;
    memberCount: number;
  } | null;
  importBatchId?: string;
  errors: Array<{ row: number; message: string }>;
};

export type ImportBatchInfo = {
  importedAt: string;
  category?: string | null;
  count: number;
  label: string;
};

export type PeopleImportHistoryItem = {
  id: string;
  importedAt: string;
  category: string;
  fileName: string;
  created: number | null;
  updated: number | null;
  unchanged: number | null;
  skipped: number | null;
  totalProcessed: number;
  mailingList: { id: string; name: string } | null;
  recorded: boolean;
};

export type InvitationReadiness = {
  total: number;
  readyCount: number;
  invalidEmailCount: number;
  existingInvitationCount: number;
  readyPersonIds: string[];
  invalidRecipients: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  existingRecipients: Array<{
    id: string;
    fullName: string;
    email: string;
    statuses: string[];
  }>;
};
