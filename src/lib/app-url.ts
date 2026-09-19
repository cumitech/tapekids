import type { AppLocale } from "@/constants/locales";
import { appBaseUrl } from "@/lib/integrations/env";
import { withLocalePath } from "@/lib/locale";
import { safeInternalPath } from "@/lib/navigation/safe-path";

export function publicAppUrl(
  path: string | null | undefined,
  locale?: AppLocale,
  fallback = "/"
) {
  const safe = safeInternalPath(path, fallback);
  const prefixed = locale ? withLocalePath(locale, safe) : safe;
  return `${appBaseUrl()}${prefixed}`;
}
