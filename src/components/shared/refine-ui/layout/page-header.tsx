"use client";

import type { ReactNode } from "react";
import { useBack, useTranslate } from "@refinedev/core";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
  showBack?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  actions,
  showBack = false,
  className,
}: PageHeaderProps) {
  const back = useBack();
  const translate = useTranslate();

  return (
    <div className={cn("mb-6 flex min-w-0 items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-1">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={back}
            className="-ml-1.5 text-muted-foreground"
            aria-label={translate("auth.back")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        ) : null}
        <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

PageHeader.displayName = "PageHeader";
