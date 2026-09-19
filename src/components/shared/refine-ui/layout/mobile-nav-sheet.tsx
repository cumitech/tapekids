"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { LocaleSelect } from "@/components/shared/refine-ui/layout/locale-select";
import { ThemeSelect } from "@/components/shared/refine-ui/theme/theme-select";
import { Button } from "@/components/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/ui/sheet";
import { cn } from "@/lib/utils";

type MobileNavSheetProps = {
  title: string;
  children: ReactNode;
  triggerClassName?: string;
};

export function MobileNavPreferences() {
  const translate = useTranslate();

  return (
    <div className="mt-auto flex flex-col gap-4 border-t px-4 py-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {translate("locale.label")}
        </p>
        <LocaleSelect className="w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {translate("theme.label")}
        </p>
        <ThemeSelect className="w-full" />
      </div>
    </div>
  );
}

export function MobileNavSheet({
  title,
  children,
  triggerClassName,
}: MobileNavSheetProps) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={translate("a11y.toggleSidebar")}
          className={cn("shrink-0", triggerClassName)}
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,20rem)] gap-0 border-l p-0"
      >
        <SheetHeader className="border-b pr-14">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">
            {translate("a11y.sidebarDescription")}
          </SheetDescription>
        </SheetHeader>
        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
