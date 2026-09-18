import { CAMPAY_HOSTS } from "@/constants/campay";
import { envFlag, readEnv } from "@/lib/integrations/env";

export type CampayEnvironment = "DEV" | "PROD";

export type CampayConfig = {
  enabled: boolean;
  environment: CampayEnvironment;
  currency: string;
  apiRoot: string;
  appId: string;
  username: string;
  password: string;
  accessToken: string;
  webhookSecret: string;
  testAmount: number;
};

function campayEnvironment(): CampayEnvironment {
  return readEnv("CAMPAY_ENVIRONMENT", "DEV").toUpperCase() === "PROD"
    ? "PROD"
    : "DEV";
}

function withApiSuffix(root: string): string {
  const trimmed = root.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function campayApiRoot(environment: CampayEnvironment): string {
  const configured = readEnv("CAMPAY_BASE_URL");
  if (configured) {
    return withApiSuffix(configured);
  }
  return withApiSuffix(CAMPAY_HOSTS[environment]);
}

export function campayConfig(): CampayConfig {
  const environment = campayEnvironment();
  const appId = readEnv("CAMPAY_APPID");
  const username = readEnv("CAMPAY_USERNAME") || appId;

  return {
    enabled: envFlag("CAMPAY_ENABLED", false),
    environment,
    currency: (readEnv("CAMPAY_CURRENCY", "XAF") || "XAF").toUpperCase(),
    apiRoot: campayApiRoot(environment),
    appId,
    username,
    password: readEnv("CAMPAY_PASSWORD"),
    accessToken: readEnv("CAMPAY_ACCESS_TOKEN"),
    webhookSecret: readEnv("CAMPAY_WEBHOOK_SECRET"),
    testAmount: Number(readEnv("CAMPAY_TEST_AMOUNT", "2")),
  };
}

export function isCampayConfigured(): boolean {
  const config = campayConfig();
  if (!config.enabled) {
    return false;
  }
  if (config.accessToken) {
    return true;
  }
  return Boolean(config.username && config.password);
}
