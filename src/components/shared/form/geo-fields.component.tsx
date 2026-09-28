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
  required?: {
    region?: boolean;
    division?: boolean;
    subDivision?: boolean;
    town?: boolean;
  };
};

export function GeoFields({
  value,
  onChange,
  labels,
  showDivisions = true,
  trailing,
  required,
}: GeoFieldsProps) {
  const geo = useGeoCascade({
    value,
    onChange,
    includeDivisions: showDivisions,
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <LabeledCombobox
        label={labels.region}
        value={geo.selection.region}
        onChange={geo.setRegion}
        options={geo.regionOptions}
        required={required?.region}
      />
      {showDivisions ? (
        <>
          <LabeledCombobox
            label={labels.division}
            value={geo.selection.division}
            onChange={geo.setDivision}
            options={geo.divisionOptions}
            required={required?.division}
          />
          <LabeledCombobox
            label={labels.subDivision}
            value={geo.selection.subDivision}
            onChange={geo.setSubDivision}
            options={geo.subDivisionOptions}
            required={required?.subDivision}
          />
        </>
      ) : null}
      <LabeledCombobox
        label={labels.town}
        value={geo.selection.town}
        onChange={geo.setTown}
        options={geo.cityOptions}
        required={required?.town}
      />
      {trailing}
    </div>
  );
}
