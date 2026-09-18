"use client";

import { createElement, useMemo } from "react";
import {
  CalendarDays,
  HeartHandshake,
  LayoutDashboard,
  Mail,
  ScrollText,
  Tent,
  UserRound,
  Users,
} from "lucide-react";
import type { ResourceProps } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";

import type { AppLocale } from "@/constants/locales";
import { resourceI18nKey } from "@/constants/resources";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { localizeResourcePath } from "@/lib/locale";

const ICON = { className: "h-4 w-4" };

export function useRefineResources(): ResourceProps[] {
  const { locale } = useLocale();
  const translate = useTranslate();

  return useMemo(() => {
    const resources: ResourceProps[] = [
      {
        name: "dashboard",
        list: "/dashboard",
        meta: {
          label: translate("dashboard.title"),
          icon: createElement(LayoutDashboard, ICON),
        },
      },
      {
        name: "people",
        list: "/dashboard/people",
        create: "/dashboard/people/create",
        edit: "/dashboard/people/edit/:id",
        show: "/dashboard/people/show/:id",
        meta: {
          label: translate(`${resourceI18nKey("people")}.titles.list`),
          icon: createElement(Users, ICON),
        },
      },
      {
        name: "mailing-lists",
        list: "/dashboard/mailing-lists",
        create: "/dashboard/mailing-lists/create",
        edit: "/dashboard/mailing-lists/edit/:id",
        show: "/dashboard/mailing-lists/show/:id",
        meta: {
          label: translate(`${resourceI18nKey("mailing-lists")}.titles.list`),
          icon: createElement(Mail, ICON),
        },
      },
      {
        name: "events",
        list: "/dashboard/events",
        create: "/dashboard/events/create",
        edit: "/dashboard/events/edit/:id",
        show: "/dashboard/events/show/:id",
        meta: {
          label: translate(`${resourceI18nKey("events")}.titles.list`),
          icon: createElement(CalendarDays, ICON),
        },
      },
      {
        name: "audit-logs",
        list: "/dashboard/audit-logs",
        meta: {
          label: translate(`${resourceI18nKey("audit-logs")}.titles.list`),
          icon: createElement(ScrollText, ICON),
        },
      },
      {
        name: "camp",
        list: "/dashboard/camp",
        meta: {
          label: translate(`${resourceI18nKey("camp")}.titles.list`),
          icon: createElement(Tent, ICON),
        },
      },
      {
        name: "sponsorships",
        list: "/dashboard/sponsorships",
        meta: {
          label: translate(`${resourceI18nKey("sponsorships")}.titles.list`),
          icon: createElement(HeartHandshake, ICON),
        },
      },
      {
        name: "profile",
        list: "/dashboard/profile",
        edit: "/dashboard/profile",
        meta: {
          label: translate(`${resourceI18nKey("profile")}.titles.list`),
          icon: createElement(UserRound, ICON),
        },
      },
    ];

    return resources.map((resource) => localizeResource(resource, locale));
  }, [locale, translate]);
}

function localizeResource(
  resource: ResourceProps,
  locale: AppLocale
): ResourceProps {
  return {
    ...resource,
    list: localizeResourcePath(locale, resource.list) as ResourceProps["list"],
    create: localizeResourcePath(
      locale,
      resource.create
    ) as ResourceProps["create"],
    edit: localizeResourcePath(locale, resource.edit) as ResourceProps["edit"],
    show: localizeResourcePath(locale, resource.show) as ResourceProps["show"],
    clone: localizeResourcePath(
      locale,
      resource.clone
    ) as ResourceProps["clone"],
  };
}
