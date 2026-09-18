import { getClientLocale } from "@/utils/locale-cookie";

const STORAGE_KEY = "kec.list-query.v2";

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

export function listQueryCacheKey(params: {
  resource: string;
  pagination?: unknown;
  filters?: unknown;
  sorters?: unknown;
}) {
  return JSON.stringify({
    r: params.resource,
    l: typeof window === "undefined" ? "en" : getClientLocale(),
    p: params.pagination,
    f: params.filters,
    s: params.sorters,
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
