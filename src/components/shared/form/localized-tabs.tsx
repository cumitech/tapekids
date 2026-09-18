"use client";

import { useTranslate } from "@refinedev/core";
import type { ReactNode } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/ui/tabs";
import { LOCALES, type AppLocale } from "@/constants/locales";
import { useLocale } from "@/hooks/core/use-locale.hook";

type LocalizedTabsProps = {
  children: (locale: AppLocale) => ReactNode;
  value?: AppLocale;
  onValueChange?: (locale: AppLocale) => void;
};

export function LocalizedTabs({
  children,
  value,
  onValueChange,
}: LocalizedTabsProps) {
  const translate = useTranslate();
  const { locale } = useLocale();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {translate("content.translationHint")}
      </p>
      <Tabs
        {...(value
          ? {
              value,
              onValueChange: (next: string) => onValueChange?.(next as AppLocale),
            }
          : { defaultValue: locale })}
        className="gap-3"
      >
        <TabsList>
          {LOCALES.map((item) => (
            <TabsTrigger key={item} value={item}>
              {translate(`locale.${item}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((item) => (
          <TabsContent key={item} value={item} className="flex flex-col gap-4">
            {children(item)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
