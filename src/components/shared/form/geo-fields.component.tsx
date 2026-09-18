"use client";

import type { ReactNode } from "react";

import { LabeledCombobox } from "@/components/shared/form/labeled-combobox";
import { useGeoCascade } from "@/hooks/geo/use-geo-cascade.hook";
import type { GeoSelection } from "@/types/geo";

type GeoFieldsProps = {
  value: Partial<GeoSelection>;
  onChange: (next: GeoSelection) => void;
  labels: {
    region: string;
    division: string;
    subDivision: string;
    town: string;
  };
  showDivisions?: boolean;
  trailing?: ReactNode;
};

export function GeoFields({
  value,
  onChange,
  labels,
  showDivisions = true,
  trailing,
}: GeoFieldsProps) {
  const geo = useGeoCascade({ value, onChange });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <LabeledCombobox
        label={labels.region}
        value={geo.selection.region}
        onChange={geo.setRegion}
        options={geo.regionOptions}
      />
      {showDivisions ? (
        <>
          <LabeledCombobox
            label={labels.division}
            value={geo.selection.division}
            onChange={geo.setDivision}
            options={geo.divisionOptions}
          />
          <LabeledCombobox
            label={labels.subDivision}
            value={geo.selection.subDivision}
            onChange={geo.setSubDivision}
            options={geo.subDivisionOptions}
          />
        </>
      ) : null}
      <LabeledCombobox
        label={labels.town}
        value={geo.selection.town}
        onChange={geo.setTown}
        options={geo.cityOptions}
      />
      {trailing}
    </div>
  );
}
