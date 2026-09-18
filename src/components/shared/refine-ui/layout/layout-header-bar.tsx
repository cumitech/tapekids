"use client";

import type { PropsWithChildren } from "react";

import { LAYOUT_CHROME_BG, LAYOUT_HEADER_SHADOW } from "@/constants/layout";
import { cn } from "@/lib/utils";

type LayoutHeaderBarProps = PropsWithChildren<{
  className?: string;
}>;

export function LayoutHeaderBar({ children, className }: LayoutHeaderBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 min-w-0 shrink-0 items-center gap-3",
        LAYOUT_CHROME_BG,
        LAYOUT_HEADER_SHADOW,
        className
      )}
    >
      {children}
    </header>
  );
}
