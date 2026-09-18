"use client";

import { useSetLocale, useTranslate } from "@refinedev/core";

import { LOCALES, type AppLocale } from "@/constants/locales";
import { useLocale } from "@/hooks/core/use-locale.hook";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shared/ui/toggle-group";
import { cn } from "@/lib/utils";

type LocaleSelectProps = {
  className?: string;
  appearance?: "default" | "inverted";
};

export function LocaleSelect({
  className,
  appearance = "default",
}: LocaleSelectProps) {
  const { locale } = useLocale();
  const setLocale = useSetLocale();
  const translate = useTranslate();

  return (
    <ToggleGroup
      type="single"
      value={locale}
      onValueChange={(value) => {
        if (value && value !== locale) {
          setLocale(value);
        }
      }}
      variant="outline"
      size="sm"
      aria-label={translate("locale.label")}
      className={cn(
        appearance === "inverted" && "border-white/40 bg-white/10 shadow-none",
        className
      )}
    >
      {LOCALES.map((item: AppLocale) => (
        <ToggleGroupItem
          key={item}
          value={item}
          aria-label={translate(`locale.${item}`)}
          className={cn(
            "min-w-10 px-2.5 uppercase",
            appearance === "default" &&
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
            appearance === "inverted" &&
              "border-white/40 text-white/80 hover:bg-white/15 hover:text-white data-[state=on]:bg-white data-[state=on]:text-primary",
          )}
        >
          {item}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
