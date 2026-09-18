"use client";

import {
  dehydrate,
  hydrate,
  QueryClient,
  type DehydratedState,
} from "@tanstack/react-query";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { clearListQueryCache } from "@/lib/client/list-query-cache";

const queryDefaults = {
  queries: {
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
};

function isAuthQueryKey(queryKey: unknown) {
  const key = JSON.stringify(queryKey).toLowerCase();
  return (
    key.includes("auth") ||
    key.includes("identity") ||
    key.includes("permissions") ||
    key.includes("getcheck")
  );
}

function persistQueryClient(client: QueryClient) {
  try {
    const state = dehydrate(client, {
      shouldDehydrateMutation: () => false,
      shouldDehydrateQuery: (query) =>
        query.state.status === "success" && !isAuthQueryKey(query.queryKey),
    });
    sessionStorage.setItem(STORAGE_KEYS.QUERY_CACHE, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function restoreQueryClient(client: QueryClient) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.QUERY_CACHE);
    if (!raw) {
      return;
    }
    const state = JSON.parse(raw) as DehydratedState;
    if (Array.isArray(state.queries)) {
      state.queries = state.queries.filter(
        (query) => !isAuthQueryKey(query.queryKey)
      );
    }
    hydrate(client, state);
  } catch {
    sessionStorage.removeItem(STORAGE_KEYS.QUERY_CACHE);
  }
}

export function forgetAuthQueries() {
  if (typeof window === "undefined") {
    return;
  }
  getAppQueryClient().removeQueries({
    predicate: (query) => isAuthQueryKey(query.queryKey),
  });
}

export function createAppQueryClient() {
  const client = new QueryClient({ defaultOptions: queryDefaults });

  if (typeof window === "undefined") {
    return client;
  }

  restoreQueryClient(client);

  let timer: number | undefined;
  client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "invalidate") {
      clearListQueryCache();
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => persistQueryClient(client), 200);
  });

  return client;
}

let browserClient: QueryClient | undefined;

export function getAppQueryClient() {
  if (typeof window === "undefined") {
    return createAppQueryClient();
  }
  if (!browserClient) {
    browserClient = createAppQueryClient();
  }
  return browserClient;
}
