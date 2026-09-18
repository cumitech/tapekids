"use client";

import { useBack, useTranslate } from "@refinedev/core";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui/button";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { cn } from "@/lib/utils";

type PageBackButtonProps = {
  className?: string;
  fallbackHref?: string;
};

export function PageBackButton({
  className,
  fallbackHref = "/dashboard",
}: PageBackButtonProps) {
  const back = useBack();
  const router = useRouter();
  const { path } = useLocale();
  const translate = useTranslate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          back();
          return;
        }
        router.push(path(fallbackHref));
      }}
      className={cn("-ml-1.5", className)}
      aria-label={translate("auth.back")}
    >
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  );
}
