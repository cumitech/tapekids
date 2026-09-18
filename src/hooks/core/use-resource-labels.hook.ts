"use client";

import { useMemo } from "react";
import { useResourceParams, useTranslate } from "@refinedev/core";

import { resourceI18nKey } from "@/constants/resources";

export type ResourceLabels = {
  titles: {
    list: string;
    create: string;
    edit: string;
    show: string;
  };
  fields: Record<string, string>;
  actions: {
    create: string;
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    show: string;
  };
  search: string;
  tableActions: string;
};

const EMPTY_FIELD_KEYS: readonly string[] = [];

export function useResourceLabels(
  resource: string,
  fieldKeys: readonly string[] = EMPTY_FIELD_KEYS
): ResourceLabels {
  const translate = useTranslate();
  const ns = resourceI18nKey(resource);

  return useMemo(() => {
    const fields: Record<string, string> = {};
    for (const key of fieldKeys) {
      fields[key] = translate(`${ns}.fields.${key}`);
    }

    return {
      titles: {
        list: translate(`${ns}.titles.list`),
        create: translate(`${ns}.titles.create`),
        edit: translate(`${ns}.titles.edit`),
        show: translate(`${ns}.titles.show`),
      },
      fields,
      actions: {
        create: translate("buttons.create"),
        edit: translate("buttons.edit"),
        save: translate("buttons.save"),
        cancel: translate("buttons.cancel"),
        delete: translate("buttons.delete"),
        show: translate("buttons.show"),
      },
      search: translate("search"),
      tableActions: translate("table.actions"),
    };
  }, [fieldKeys, ns, translate]);
}

export function useResourceViewTitle(
  action: "list" | "create" | "edit" | "show",
  resourceFromProps?: string
) {
  const translate = useTranslate();
  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const name = identifier ?? resource?.name ?? "";
  const fallback = resource?.meta?.label ?? name;

  if (name === "dashboard") {
    return translate("dashboard.title", fallback);
  }

  return translate(`${resourceI18nKey(name)}.titles.${action}`, fallback);
}
