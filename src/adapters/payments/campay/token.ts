import axios from "axios";

import { CAMPAY_PATHS } from "@/constants/campay";
import { campayConfig } from "@/lib/integrations/campay.config";
import { logger } from "@/lib/logger";
import { campayErrorMessage } from "./errors";

const TOKEN_TTL_MS = 55 * 60 * 1000;

type TokenCache = {
  value: string | null;
  expiresAt: number;
  source: "static" | "fetched" | null;
};

const tokenCache: TokenCache = {
  value: null,
  expiresAt: 0,
  source: null,
};

let tokenPromise: Promise<string> | null = null;

export function invalidateCampayToken() {
  tokenCache.value = null;
  tokenCache.expiresAt = 0;
  tokenCache.source = null;
}

export function campayTokenSource() {
  return tokenCache.source;
}

async function requestAccessToken(username: string, password: string): Promise<string> {
  const { apiRoot } = campayConfig();
  try {
    const response = await axios.post(
      `${apiRoot}${CAMPAY_PATHS.token}`,
      { username, password },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      }
    );
    const token = response.data?.token;
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token response from CamPay.");
    }
    return token;
  } catch (error) {
    logger.error("campay.token_failed", { message: campayErrorMessage(error) });
    throw new Error(campayErrorMessage(error));
  }
}

export async function getCampayAccessToken(
  options: { forceRefresh?: boolean } = {}
): Promise<string> {
  if (
    !options.forceRefresh &&
    tokenCache.value &&
    tokenCache.expiresAt > Date.now()
  ) {
    return tokenCache.value;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    const { accessToken, username, password } = campayConfig();

    if (!options.forceRefresh && accessToken) {
      tokenCache.value = accessToken;
      tokenCache.expiresAt = Number.MAX_SAFE_INTEGER;
      tokenCache.source = "static";
      return accessToken;
    }

    if (!username || !password) {
      throw new Error(
        "CamPay username and password are required to request an access token."
      );
    }

    const token = await requestAccessToken(username, password);
    tokenCache.value = token;
    tokenCache.expiresAt = Date.now() + TOKEN_TTL_MS;
    tokenCache.source = "fetched";
    return token;
  })();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}
