"use client";

import { useTranslate } from "@refinedev/core";

import { GeoFields } from "@/components/shared/form/geo-fields.component";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import {
  isGeoFilter,
  type TableFilterField,
} from "@/components/shared/refine-ui/data-table/table-filter-field";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { DEFAULT_COUNTRY } from "@/constants/geo";
import type { GeoSelection } from "@/types/geo";

const ALL_VALUE = "__all__";
const GEO_KEYS = [
  "region",
  "division",
  "subDivision",
  "town",
] as const;

type ListFilterFieldsProps = {
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  filters?: TableFilterField[];
  search?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  onSearchSubmit?: () => void;
};

export function ListFilterFields({
  values,
  onChange,
  filters = [],
  search = true,
  searchLabel,
  searchPlaceholder,
  onSearchSubmit,
}: ListFilterFieldsProps) {
  const translate = useTranslate();
  const attributeFilters = filters.filter((field) => !isGeoFilter(field));
  const geoFilter = filters.find(isGeoFilter);
  const geoValue: GeoSelection = {
    country: values.country || DEFAULT_COUNTRY,
    region: values.region ?? "",
    division: values.division ?? "",
    subDivision: values.subDivision ?? "",
    town: values.town ?? "",
  };

  const setField = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="flex flex-col gap-3">
      {search ? (
        <div className="flex flex-col gap-1.5">
          <Label>{searchLabel ?? translate("search")}</Label>
          <Input
            value={values.q ?? ""}
            placeholder={
              searchPlaceholder ?? translate("table.filter.searchPlaceholder")
            }
            onChange={(event) => setField("q", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchSubmit?.();
              }
            }}
          />
        </div>
      ) : null}
      {geoFilter ? (
        <GeoFields
          value={geoValue}
          showDivisions={geoFilter.showDivisions}
          onChange={(next) =>
            onChange({
              ...values,
              region: next.region,
              division: next.division,
              subDivision: next.subDivision,
              town: next.town,
            })
          }
          labels={{
            region: translate("people.fields.region"),
            division: translate("people.fields.division"),
            subDivision: translate("people.fields.subDivision"),
            town: translate("people.fields.town"),
          }}
        />
      ) : null}
      {attributeFilters.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attributeFilters.map((field) =>
            field.type === "select" ? (
              <LabeledSelect
                key={field.field}
                label={field.label}
                value={values[field.field] || ALL_VALUE}
                placeholder={translate("table.filter.all")}
                onChange={(next) =>
                  setField(field.field, next === ALL_VALUE ? "" : next)
                }
                options={[
                  { value: ALL_VALUE, label: translate("table.filter.all") },
                  ...(field.options ?? []),
                ]}
              />
            ) : (
              <div key={field.field} className="flex flex-col gap-1.5">
                <Label>{field.label}</Label>
                <Input
                  value={values[field.field] ?? ""}
                  onChange={(event) => setField(field.field, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSearchSubmit?.();
                    }
                  }}
                />
              </div>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

export { GEO_KEYS };
