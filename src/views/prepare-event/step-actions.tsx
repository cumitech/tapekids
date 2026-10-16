"use client";

import type { ReactNode } from "react";
import { useTranslate } from "@refinedev/core";

import { Button } from "@/components/shared/ui/button";

export function StepActions({
  onBack,
  children,
}: {
  onBack?: () => void;
  children?: ReactNode;
}) {
  const translate = useTranslate();
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          {translate("prepareEvent.back")}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
