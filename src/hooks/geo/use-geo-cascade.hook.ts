"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_COUNTRY } from "@/constants/geo";
import { apiGet } from "@/lib/client/api";
import { toGeoOptions, withCurrentOption } from "@/lib/geo/options";
import type { GeoKind, GeoOption, GeoSelection } from "@/types/geo";

const EMPTY: GeoSelection = {
  country: DEFAULT_COUNTRY,
  region: "",
  division: "",
  subDivision: "",
  town: "",
};

type UseGeoCascadeParams = {
  value?: Partial<GeoSelection>;
  onChange: (next: GeoSelection) => void;
  includeDivisions?: boolean;
};

const geoCache = new Map<string, string[]>();
const geoPending = new Map<string, Promise<string[]>>();

async function loadKind(kind: GeoKind, filters: Partial<GeoSelection>) {
  const params = new URLSearchParams({ kind });
  if (filters.region) params.set("region", filters.region);
  if (filters.division) params.set("division", filters.division);
  const key = params.toString();
  const cached = geoCache.get(key);
  if (cached) {
    return cached;
  }
  const pending = geoPending.get(key);
  if (pending) {
    return pending;
  }

  const request = apiGet<string[]>(`/geo?${key}`)
    .then((names) => {
      geoCache.set(key, names);
      return names;
    })
    .catch(() => [])
    .finally(() => {
      geoPending.delete(key);
    });
  geoPending.set(key, request);
  return request;
}

function withCameroon(value?: Partial<GeoSelection>): GeoSelection {
  return {
    ...EMPTY,
    ...value,
    country: DEFAULT_COUNTRY,
  };
}

export function useGeoCascade({
  value,
  onChange,
  includeDivisions = true,
}: UseGeoCascadeParams) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const selection = withCameroon(value);

  const [regionOptions, setRegionOptions] = useState<GeoOption[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<GeoOption[]>([]);
  const [subDivisionOptions, setSubDivisionOptions] = useState<GeoOption[]>([]);
  const [cityOptions, setCityOptions] = useState<GeoOption[]>([]);

  const patch = useCallback(
    (partial: Partial<GeoSelection>) => {
      onChange(withCameroon({ ...valueRef.current, ...partial }));
    },
    [onChange]
  );

  useEffect(() => {
    void loadKind("regions", {}).then((names) =>
      setRegionOptions(toGeoOptions(names))
    );
  }, []);

  useEffect(() => {
    if (!selection.region) {
      setDivisionOptions([]);
      setCityOptions([]);
      return;
    }
    if (includeDivisions) {
      void loadKind("divisions", { region: selection.region }).then((names) =>
        setDivisionOptions(toGeoOptions(names))
      );
    }
    void loadKind("cities", { region: selection.region }).then((names) =>
      setCityOptions(toGeoOptions(names))
    );
  }, [includeDivisions, selection.region]);

  useEffect(() => {
    if (!includeDivisions || !selection.region || !selection.division) {
      setSubDivisionOptions([]);
      return;
    }
    void loadKind("subdivisions", {
      region: selection.region,
      division: selection.division,
    }).then((names) => setSubDivisionOptions(toGeoOptions(names)));
  }, [includeDivisions, selection.region, selection.division]);

  return {
    selection,
    setRegion: (region: string) =>
      patch({ region, division: "", subDivision: "", town: "" }),
    setDivision: (division: string) => patch({ division, subDivision: "" }),
    setSubDivision: (subDivision: string) => patch({ subDivision }),
    setTown: (town: string) => patch({ town }),
    regionOptions: withCurrentOption(regionOptions, selection.region),
    divisionOptions: withCurrentOption(divisionOptions, selection.division),
    subDivisionOptions: withCurrentOption(
      subDivisionOptions,
      selection.subDivision
    ),
    cityOptions: withCurrentOption(cityOptions, selection.town),
  };
}
