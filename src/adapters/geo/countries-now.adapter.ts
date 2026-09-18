import { COUNTRIES_NOW_BASE_URL } from "@/constants/geo";
import type {
  CountriesNowCountryStates,
  CountriesNowEnvelope,
} from "@/types/geo";

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
  const data = await readEnvelope<CountriesNowCountryStates>(
    `/countries/states/q?country=${encodeURIComponent(country)}`
  );
  return (data.states ?? []).map((state) => state.name).filter(Boolean);
}

export async function fetchCities(country: string, region: string): Promise<string[]> {
  try {
    const data = await readEnvelope<string[]>(
      `/countries/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(region)}`
    );
    return Array.isArray(data) ? data.filter(Boolean).sort() : [];
  } catch {
    const data = await readEnvelope<string[]>("/countries/state/cities", {
      method: "POST",
      body: JSON.stringify({ country, state: region }),
    });
    return Array.isArray(data) ? data.filter(Boolean).sort() : [];
  }
}
