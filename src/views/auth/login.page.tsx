"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SignInForm } from "@/components/shared/refine-ui/form/sign-in-form";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMounted } from "@/hooks/core/use-mounted.hook";
import { safeInternalPath } from "@/lib/navigation/safe-path";
import { getSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { path } = useLocale();
  const ready = useMounted();
  const dashboardPath = path("/dashboard");
  const redirectTo = safeInternalPath(
    searchParams.get("redirect") ?? searchParams.get("to"),
    dashboardPath
  );
  const defaultEmail = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (getSession()?.token) {
      router.replace(redirectTo);
    }
  }, [dashboardPath, ready, redirectTo, router]);

  return (
    <PublicShell>
      <SignInForm defaultEmail={defaultEmail} redirectTo={redirectTo} />
    </PublicShell>
  );
}
