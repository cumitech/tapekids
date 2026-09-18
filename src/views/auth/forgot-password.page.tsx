"use client";

import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/shared/refine-ui/form/forgot-password-form";
import { PublicShell } from "@/views/auth/public-shell";

export function ForgotPasswordPage() {
  return (
    <PublicShell>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </PublicShell>
  );
}
