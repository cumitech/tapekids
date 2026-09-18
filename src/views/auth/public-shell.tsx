"use client";

import type { PropsWithChildren } from "react";

import { PublicHeader } from "@/components/shared/refine-ui/layout/public-header";
import { AppFooter } from "@/components/shared/layout/app-footer";

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <AppFooter />
    </div>
  );
}
