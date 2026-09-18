import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_URL } from "@/constants/api-url";
import { getAccessToken } from "@/utils/auth-storage";
import { getClientLocale } from "@/utils/locale-cookie";

export const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-App-Locale"] = getClientLocale();

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);
