"use client";

import { Trophy } from "lucide-react";

export function PersonTrophy({ label }: { label: string }) {
  return (
    <span
      className="relative inline-flex size-10 shrink-0 items-center justify-center sm:size-11"
      title={label}
      aria-label={label}
    >
      <span className="absolute inset-0 animate-pulse rounded-full bg-[#f59f21]/35" />
      <span className="relative flex size-9 items-center justify-center rounded-full bg-[#f59f21] shadow-[0_0_16px_rgba(245,159,33,0.75)] sm:size-10">
        <Trophy
          className="size-5 fill-[#fff4d6] text-[#7a4e08] [animation:trophy-gleam_2.2s_ease-in-out_infinite] sm:size-6"
          aria-hidden
        />
      </span>
    </span>
  );
}
