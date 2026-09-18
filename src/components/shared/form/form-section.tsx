"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold tracking-wide text-[#182356] dark:text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
