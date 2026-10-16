import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_URL } from "@/constants/api-url";
import { invalidateListsForApiPath } from "@/lib/client/invalidate-lists";
import { getAccessToken } from "@/utils/auth-storage";
import { getClientLocale } from "@/utils/locale-cookie";

export const http = axios.create({
  baseURL: API_URL,
});

const inflightGets = new Map<string, Promise<AxiosResponse>>();

function getRequestKey(config: InternalAxiosRequestConfig) {
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${(config.method ?? "get").toLowerCase()}|${config.baseURL ?? ""}|${config.url ?? ""}|${params}`;
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-App-Locale"] = getClientLocale();

  if ((config.method ?? "get").toLowerCase() === "get") {
    const key = getRequestKey(config);
    const adapter = (http.defaults.adapter ?? axios.defaults.adapter) as
      | AxiosAdapter
      | undefined;
    if (typeof adapter === "function") {
      config.adapter = () => {
        const existing = inflightGets.get(key);
        if (existing) {
          return existing;
        }
        const request = Promise.resolve(adapter(config)).finally(() => {
          inflightGets.delete(key);
        });
        inflightGets.set(key, request);
        return request;
      };
    }
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    invalidateListsForApiPath(response.config.url, response.config.method);
    return response;
  },
  (error: AxiosError) => Promise.reject(error)
);
