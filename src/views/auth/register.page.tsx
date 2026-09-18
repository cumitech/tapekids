"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SignUpForm } from "@/components/shared/refine-ui/form/sign-up-form";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { getSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";

export function RegisterPage() {
  const router = useRouter();
  const { path } = useLocale();
  const dashboardPath = path("/dashboard");

  useEffect(() => {
    router.prefetch(dashboardPath);
    void fetch(dashboardPath, { credentials: "same-origin" });
    if (getSession()?.token) {
      router.replace(dashboardPath);
    }
  }, [dashboardPath, router]);

  return (
    <PublicShell>
      <SignUpForm />
    </PublicShell>
  );
}
