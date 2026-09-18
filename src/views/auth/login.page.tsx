"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SignInForm } from "@/components/shared/refine-ui/form/sign-in-form";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMounted } from "@/hooks/core/use-mounted.hook";
import { getSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";

export function LoginPage() {
  const router = useRouter();
  const { path } = useLocale();
  const ready = useMounted();
  const dashboardPath = path("/dashboard");

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (getSession()?.token) {
      router.replace(dashboardPath);
    }
  }, [dashboardPath, ready, router]);

  return (
    <PublicShell>
      <SignInForm />
    </PublicShell>
  );
}
