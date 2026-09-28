export type PeopleImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
};
