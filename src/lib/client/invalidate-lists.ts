"use client";

import { getAppQueryClient } from "@/lib/client/query-client";
import { clearListQueryCache } from "@/lib/client/list-query-cache";

const RELATED: Record<string, readonly string[]> = {
  people: [
    "people",
    "mailing-lists",
    "trophy",
    "waiting-list",
    "payments",
    "sponsors",
    "reports/trophy-participants",
    "reports/trophy-campers",
    "reports/chaperones",
    "reports/participants",
    "reports/sponsors",
  ],
  "waiting-list": [
    "waiting-list",
    "people",
    "trophy",
    "reports/trophy-participants",
    "reports/trophy-campers",
    "reports/waiting-list",
  ],
  events: [
    "events",
    "trophy",
    "mailing-lists",
    "sponsors",
    "payments",
    "reports/trophy-participants",
    "reports/trophy-campers",
    "reports/participants",
    "reports/sponsors",
  ],
  "mailing-lists": [
    "mailing-lists",
    "trophy",
    "reports/trophy-participants",
    "reports/trophy-campers",
  ],
  trophy: ["trophy", "reports/trophy-participants", "reports/trophy-campers"],
  "reports/trophy-participants": ["trophy", "reports/trophy-participants"],
  "reports/trophy-campers": ["trophy", "reports/trophy-campers"],
  sponsors: ["sponsors", "payments", "reports/sponsors"],
  payments: ["payments", "sponsors", "reports/sponsors"],
  "audit-logs": ["audit-logs"],
  invitations: [
    "mailing-lists",
    "people",
    "trophy",
    "reports/trophy-participants",
    "reports/trophy-campers",
  ],
};

const PATH_RESOURCES: Array<[string, string]> = [
  ["/waiting-list", "waiting-list"],
  ["/reports/trophy-participants", "reports/trophy-participants"],
  ["/reports/trophy-campers", "reports/trophy-campers"],
  ["/reports/chaperones", "reports/chaperones"],
  ["/reports/participants", "reports/participants"],
  ["/reports/sponsors", "reports/sponsors"],
  ["/reports/waiting-list", "reports/waiting-list"],
  ["/mailing-lists", "mailing-lists"],
  ["/invitation", "invitations"],
  ["/people", "people"],
  ["/events", "events"],
  ["/trophy", "trophy"],
  ["/sponsors", "sponsors"],
  ["/payments", "payments"],
  ["/me/payments", "payments"],
  ["/me", "people"],
];

const SKIP_PREFIXES = ["/auth", "/public", "/uploads", "/integrations"];

let debounceTimer: number | undefined;
const pending = new Set<string>();

export function expandListResources(resources: string[]) {
  const next = new Set<string>();
  for (const resource of resources) {
    next.add(resource);
    for (const related of RELATED[resource] ?? []) {
      next.add(related);
    }
  }
  return [...next];
}

export function invalidateListCaches(...resources: string[]) {
  if (typeof window === "undefined" || resources.length === 0) {
    return;
  }
  for (const resource of expandListResources(resources)) {
    pending.add(resource);
  }
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(flushListInvalidation, 40);
}

export function invalidateListsForApiPath(url?: string, method?: string) {
  const verb = (method ?? "get").toLowerCase();
  if (verb === "get" || verb === "head" || verb === "options") {
    return;
  }
  const path = apiPathname(url);
  if (!path || shouldSkipPath(path)) {
    return;
  }
  const resource = resourceFromPath(path);
  if (resource) {
    invalidateListCaches(resource);
  }
}

function flushListInvalidation() {
  const targets = [...pending];
  pending.clear();
  for (const resource of targets) {
    clearListQueryCache(resource);
  }
  if (typeof window === "undefined") {
    return;
  }
  void getAppQueryClient().invalidateQueries({
    predicate: (query) =>
      targets.some((resource) => queryKeyTouches(query.queryKey, resource)),
    refetchType: "all",
  });
}

function queryKeyTouches(queryKey: readonly unknown[], resource: string) {
  return queryKey.some((part) => {
    if (part === resource) {
      return true;
    }
    if (part && typeof part === "object" && "resource" in part) {
      return (part as { resource?: unknown }).resource === resource;
    }
    return false;
  });
}

function apiPathname(url?: string) {
  if (!url) {
    return "";
  }
  try {
    const path = url.startsWith("http")
      ? new URL(url).pathname
      : url.split("?")[0];
    return path.replace(/^\/api(?=\/|$)/, "") || path;
  } catch {
    return url.split("?")[0];
  }
}

function shouldSkipPath(path: string) {
  if (path.endsWith("/refresh") || path.endsWith("/stats")) {
    return true;
  }
  return SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function resourceFromPath(path: string) {
  for (const [prefix, resource] of PATH_RESOURCES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return resource;
    }
  }
  return "";
}
