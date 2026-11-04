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
  errors: Array<{ row: number; message: string }>;
};

export type ImportBatchInfo = {
  importedAt: string;
  category?: string | null;
  count: number;
  label: string;
};
