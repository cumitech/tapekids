export type PeopleImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  importedAt?: string;
  errors: Array<{ row: number; message: string }>;
};

export type ImportBatchInfo = {
  importedAt: string;
  category?: string | null;
  count: number;
  label: string;
};

