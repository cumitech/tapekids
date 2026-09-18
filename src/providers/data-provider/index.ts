"use client";

import type { DataProvider } from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";

import {
  clearListQueryCache,
  getListQueryCache,
  listQueryCacheKey,
  setListQueryCache,
} from "@/lib/client/list-query-cache";
import { unwrapEnvelope } from "@/lib/client/api";
import { http } from "@/utils/axios";

const LOCAL_RESOURCES = new Set([
  "dashboard",
  "camp",
  "sponsorships",
  "profile",
]);

// Axios already uses API_URL as baseURL. Passing it here again produced /api/api/*.
const restProvider = dataProviderSimpleRest("", http);

export const dataProvider = {
  ...restProvider,
  getList: async (params) => {
    if (LOCAL_RESOURCES.has(params.resource) || params.resource === "me") {
      return { data: [], total: 0 };
    }

    const cacheKey = listQueryCacheKey(params);
    const skipCache = Boolean(params.meta?.skipCache);
    const cached = skipCache ? undefined : getListQueryCache(cacheKey);
    if (cached) {
      return {
        data: cached.data,
        total: cached.total,
      };
    }

    const result = await restProvider.getList(params);
    if (!skipCache) {
      setListQueryCache(cacheKey, {
        data: result.data,
        total: result.total,
      });
    }
    return result;
  },
  getOne: async (params) => {
    if (params.resource === "me") {
      const { data } = await http.get("/me");
      const profile = unwrapEnvelope<{
        user: { email: string };
        person: Record<string, unknown> | null;
      }>(data);
      return {
        data: {
          email: profile.user.email,
          firstName: "",
          lastName: "",
          ...(profile.person ?? {}),
          id: "me",
        },
      };
    }
    return restProvider.getOne(params);
  },
  create: async (params) => {
    const result = await restProvider.create(params);
    clearListQueryCache(params.resource);
    return result;
  },
  update: async (params) => {
    if (params.resource === "me") {
      const { data } = await http.patch("/me", params.variables);
      const person = unwrapEnvelope<Record<string, unknown>>(data);
      clearListQueryCache("people");
      return { data: { ...person, id: "me" } };
    }
    const result = await restProvider.update(params);
    clearListQueryCache(params.resource);
    return result;
  },
  deleteOne: async (params) => {
    const result = await restProvider.deleteOne(params);
    clearListQueryCache(params.resource);
    return result;
  },
} as DataProvider;
