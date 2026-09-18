"use client";

import { useEffect, useMemo } from "react";
import { useList, useTranslate } from "@refinedev/core";

import { LabeledSelect } from "@/components/shared/form/labeled-select";
import type { Event } from "@/models/events/event.model";

type EventSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EventSelect({ value, onChange }: EventSelectProps) {
  const translate = useTranslate();
  const { query } = useList<Event>({
    resource: "events",
    pagination: { currentPage: 1, pageSize: 100 },
    sorters: [{ field: "startsAt", order: "asc" }],
    meta: { skipCache: true },
    queryOptions: {
      staleTime: 0,
      refetchOnMount: "always",
    },
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? [])
        .filter((event): event is Event & { id: string } => Boolean(event.id))
        .map((event) => ({
          value: event.id,
          label: event.title,
        })),
    [query.data?.data]
  );

  useEffect(() => {
    if (value && options.length > 0 && !options.some((option) => option.value === value)) {
      onChange("");
    }
  }, [onChange, options, value]);

  return (
    <LabeledSelect
      label={translate("events.titles.list")}
      value={value}
      onChange={onChange}
      placeholder={translate("mailingLists.selectEvent")}
      options={options}
    />
  );
}
