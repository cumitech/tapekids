import type { SelectOption } from "@/components/shared/form/labeled-select";

export type TableFilterField =
  | {
      type: "geo";
      showDivisions?: boolean;
    }
  | {
      field: string;
      label: string;
      type?: "text" | "select";
      options?: SelectOption[];
    };

export function isGeoFilter(
  field: TableFilterField
): field is Extract<TableFilterField, { type: "geo" }> {
  return field.type === "geo";
}
