import { COUNTRIES_NOW_BASE_URL } from "@/constants/geo";
import type {
  CountriesNowCountryStates,
  CountriesNowEnvelope,
} from "@/types/geo";

const GEO_TTL_MS = 24 * 60 * 60 * 1000;
const geoMemory = new Map<string, { at: number; data: string[] }>();

function remember(key: string, data: string[]) {
  geoMemory.set(key, { at: Date.now(), data });
  return data;
}

function remembered(key: string) {
  const hit = geoMemory.get(key);
  if (!hit || Date.now() - hit.at > GEO_TTL_MS) {
    return null;
  }
  return hit.data;
}

async function readEnvelope<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${COUNTRIES_NOW_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`Countries Now request failed (${response.status})`);
  }

  const payload = (await response.json()) as CountriesNowEnvelope<T>;
  if (payload.error) {
    throw new Error(payload.msg || "Countries Now returned an error");
  }
  return payload.data;
}

export async function fetchRegions(country: string): Promise<string[]> {
  const key = `regions:${country}`;
  const cached = remembered(key);
  if (cached) {
    return cached;
  }
  const data = await readEnvelope<CountriesNowCountryStates>(
    `/countries/states/q?country=${encodeURIComponent(country)}`
  );
  return remember(
    key,
    (data.states ?? []).map((state) => state.name).filter(Boolean)
  );
}

export async function fetchCities(country: string, region: string): Promise<string[]> {
  const key = `cities:${country}:${region}`;
  const cached = remembered(key);
  if (cached) {
    return cached;
  }
  try {
    const data = await readEnvelope<string[]>(
      `/countries/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(region)}`
    );
    return remember(key, Array.isArray(data) ? data.filter(Boolean).sort() : []);
  } catch {
    const data = await readEnvelope<string[]>("/countries/state/cities", {
      method: "POST",
      body: JSON.stringify({ country, state: region }),
    });
    return remember(key, Array.isArray(data) ? data.filter(Boolean).sort() : []);
  }
}
