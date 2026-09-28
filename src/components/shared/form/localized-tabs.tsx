"use client";

import { useState, type ReactNode } from "react";
import { useTranslate } from "@refinedev/core";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/ui/tabs";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { localesPreferDefault } from "@/lib/content-i18n/pick";

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
  const locales = localesPreferDefault();
  const [internal, setInternal] = useState<AppLocale>(DEFAULT_LOCALE);
  const selected = value ?? internal;

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        value={selected}
        onValueChange={(next: string) => {
          const locale = next as AppLocale;
          if (value == null) {
            setInternal(locale);
          }
          onValueChange?.(locale);
        }}
        className="gap-3"
      >
        <TabsList>
          {locales.map((item) => (
            <TabsTrigger key={item} value={item}>
              {translate(`locale.${item}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((item) => (
          <TabsContent key={item} value={item} className="flex flex-col gap-4">
            {children(item)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
