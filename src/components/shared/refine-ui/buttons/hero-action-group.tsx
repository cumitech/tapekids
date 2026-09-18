"use client";

import { Children, type PropsWithChildren, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HeroActionGroup({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const items = Children.toArray(children).filter(Boolean) as ReactNode[];

  return (
    <div
      data-hero-group
      className={cn(
        "inline-flex h-10 max-w-full items-stretch overflow-hidden rounded-xl bg-white text-primary",
        className
      )}
    >
      {items.map((child, index) => (
        <span key={index} className="flex min-w-0 items-stretch">
          {index > 0 ? (
            <span className="w-px shrink-0 bg-primary/15" aria-hidden />
          ) : null}
          {child}
        </span>
      ))}
    </div>
  );
}
