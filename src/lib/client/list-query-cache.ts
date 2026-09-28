import { DEFAULT_LOCALE } from "@/constants/locales";
import { getClientLocale } from "@/utils/locale-cookie";

const STORAGE_KEY = "kec.list-query.v3";

type ListCacheEntry = {
  data: unknown[];
  total: number;
};

function readStore(): Record<string, ListCacheEntry> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      ListCacheEntry
    >;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ListCacheEntry>) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, stableValue(record[key])])
    );
  }
  return value;
}

function paginationKey(pagination: unknown) {
  if (!pagination || typeof pagination !== "object") {
    return { page: 1, size: 10 };
  }
  const value = pagination as {
    current?: number;
    currentPage?: number;
    pageSize?: number;
  };
  return {
    page: value.currentPage ?? value.current ?? 1,
    size: value.pageSize ?? 10,
  };
}

export function listQueryCacheKey(params: {
  resource: string;
  pagination?: unknown;
  filters?: unknown;
  sorters?: unknown;
}) {
  return JSON.stringify({
    r: params.resource,
    l: typeof window === "undefined" ? DEFAULT_LOCALE : getClientLocale(),
    p: paginationKey(params.pagination),
    f: stableValue(params.filters),
    s: stableValue(params.sorters),
  });
}

export function getListQueryCache(key: string): ListCacheEntry | undefined {
  return readStore()[key];
}

export function setListQueryCache(key: string, value: ListCacheEntry) {
  const store = readStore();
  store[key] = value;
  writeStore(store);
}

export function clearListQueryCache(resource?: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!resource) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  const store = readStore();
  const needle = `"r":"${resource}"`;
  for (const key of Object.keys(store)) {
    if (key.includes(needle)) {
      delete store[key];
    }
  }
  writeStore(store);
}
