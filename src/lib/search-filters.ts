import type { CrudFilter } from "@refinedev/core";

export function textSearchFilters(
  fields: readonly string[],
  search: string
): CrudFilter[] {
  const value = search.trim();
  if (!value || fields.length === 0) {
    return [];
  }

  if (fields.length === 1) {
    return [
      {
        field: fields[0],
        operator: "contains",
        value,
      },
    ];
  }

  return [
    {
      operator: "or",
      value: fields.map((field) => ({
        field,
        operator: "contains" as const,
        value,
      })),
    },
  ];
}
