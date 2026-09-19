"use client";

import { useTranslate } from "@refinedev/core";

import { formatPhoneDisplay } from "@/lib/phone";
import { cn } from "@/lib/utils";

type RecordDetailsProps = {
  fields: Record<string, unknown>;
  labels: Record<string, string>;
  className?: string;
};

export function RecordDetails({
  fields,
  labels,
  className,
}: RecordDetailsProps) {
  const translate = useTranslate();

  return (
    <dl
      className={cn(
        "grid gap-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] sm:grid-cols-2 dark:bg-card",
        className
      )}
    >
      {Object.entries(fields).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">{labels[key]}</dt>
          <dd>{formatRecordValue(key, value, translate)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatRecordValue(
  key: string,
  value: unknown,
  translate: (key: string, defaultMessage?: string) => string
) {
  if (value == null || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return translate(value ? "yes" : "no");
  }

  if (typeof value === "string" && /phone/i.test(key)) {
    return formatPhoneDisplay(value) || value;
  }

  return String(value);
}
