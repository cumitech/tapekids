export type GeoOption = {
  value: string;
  label: string;
};

export type GeoSelection = {
  country: string;
  region: string;
  division: string;
  subDivision: string;
  town: string;
};

export type GeoKind = "regions" | "cities" | "divisions" | "subdivisions";

export type CountriesNowEnvelope<T> = {
  error: boolean;
  msg?: string;
  data: T;
};

export type CountriesNowState = {
  name: string;
  state_code?: string;
};

export type CountriesNowCountryStates = {
  name: string;
  iso3?: string;
  iso2?: string;
  states: CountriesNowState[];
};
