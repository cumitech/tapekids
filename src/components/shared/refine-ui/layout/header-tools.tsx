"use client";

import { LocaleSelect } from "@/components/shared/refine-ui/layout/locale-select";
import { UserMenu } from "@/components/shared/refine-ui/layout/user-menu";
import { ThemeSelect } from "@/components/shared/refine-ui/theme/theme-select";
import { cn } from "@/lib/utils";

type HeaderToolsProps = {
  className?: string;
};

export function HeaderTools({ className }: HeaderToolsProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <LocaleSelect />
      <ThemeSelect className="hidden sm:flex" />
      <UserMenu />
    </div>
  );
}
