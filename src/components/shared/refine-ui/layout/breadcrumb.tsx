"use client";

import { Fragment, useMemo } from "react";
import { useBreadcrumb, useLink, useTranslate } from "@refinedev/core";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shared/ui/breadcrumb";
import { useLocale } from "@/hooks/core/use-locale.hook";

function labelText(
  translate: (key: string, options?: string) => string,
  value: string
) {
  const translated = translate(value, value);
  return translated || value;
}

export function Breadcrumb() {
  const Link = useLink();
  const { breadcrumbs } = useBreadcrumb();
  const { path } = useLocale();
  const translate = useTranslate();
  const homeHref = path("/dashboard");
  const homeLabel = translate("dashboard.title");

  const items = useMemo(() => {
    return breadcrumbs
      .map((item) => ({
        label: labelText(translate, item.label),
        href: item.href,
      }))
      .filter((item) => item.label && item.label !== homeLabel);
  }, [breadcrumbs, homeLabel, translate]);

  const onHome = items.length === 0;

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList className="text-sm">
        {onHome ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {homeLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild className="text-muted-foreground">
              <Link to={homeHref}>{homeLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="text-muted-foreground">
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

Breadcrumb.displayName = "Breadcrumb";
