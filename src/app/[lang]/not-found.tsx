"use client";

import { Suspense } from "react";
import { Authenticated } from "@refinedev/core";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import { useLocale } from "@/hooks/core/use-locale.hook";

export default function LocaleNotFound() {
  const { path } = useLocale();

  return (
    <Suspense>
      <Authenticated key="not-found" redirectOnFail={path("/login")}>
        <ErrorComponent />
      </Authenticated>
    </Suspense>
  );
}
