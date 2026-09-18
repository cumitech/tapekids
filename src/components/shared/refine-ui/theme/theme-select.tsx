"use client";

import { useTranslate } from "@refinedev/core";
import { Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/components/shared/refine-ui/theme/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { cn } from "@/lib/utils";

type ThemeSelectProps = {
  className?: string;
  appearance?: "default" | "inverted";
};

const THEMES: Theme[] = ["light", "dark"];

export function ThemeSelect({
  className,
  appearance = "default",
}: ThemeSelectProps) {
  const { theme, setTheme } = useTheme();
  const translate = useTranslate();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger
        size="sm"
        aria-label={translate("theme.label")}
        className={cn(
          "min-w-0",
          appearance === "inverted" &&
            "border-white/40 bg-white/10 text-white shadow-none hover:bg-white/15 focus-visible:border-white focus-visible:ring-white/40 [&_svg]:text-white",
          className
        )}
      >
        <SelectValue placeholder={translate("theme.label")} />
      </SelectTrigger>
      <SelectContent align="end">
        {THEMES.map((item) => (
          <SelectItem key={item} value={item}>
            <span className="flex items-center gap-2">
              {item === "light" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              {translate(`theme.${item}`)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

ThemeSelect.displayName = "ThemeSelect";
