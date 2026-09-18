import {
  fetchCities,
  fetchRegions,
} from "@/adapters/geo/countries-now.adapter";
import { DEFAULT_COUNTRY } from "@/constants/geo";
import {
  listCameroonDivisions,
  listCameroonSubDivisions,
} from "@/data/geo/cameroon-admin";
import { ValidationException } from "@/exceptions/validation.exception";
import type { GeoKind } from "@/types/geo";

export class GeoService {
  list(kind: GeoKind, filters: {
    region?: string;
    division?: string;
  }) {
    switch (kind) {
      case "regions":
        return fetchRegions(DEFAULT_COUNTRY);
      case "cities":
        if (!filters.region) {
          throw new ValidationException("A region is required to list cities.");
        }
        return fetchCities(DEFAULT_COUNTRY, filters.region);
      case "divisions":
        if (!filters.region) {
          return Promise.resolve([]);
        }
        return Promise.resolve(listCameroonDivisions(filters.region));
      case "subdivisions":
        if (!filters.region || !filters.division) {
          return Promise.resolve([]);
        }
        return Promise.resolve(
          listCameroonSubDivisions(filters.region, filters.division)
        );
      default:
        throw new ValidationException("Unknown geo kind.");
    }
  }
}

export const geoService = new GeoService();
