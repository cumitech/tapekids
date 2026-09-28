"use client";

import type { ReactNode } from "react";

import { Progress } from "@/components/shared/ui/progress";
import { cn } from "@/lib/utils";

type FormStepperProps = {
  labels: string[];
  index: number;
  progressLabel: string;
  onSelect: (index: number) => void;
  canSelect?: (index: number) => boolean;
  size?: "compact" | "comfortable";
};

export function FormStepper({
  labels,
  index,
  progressLabel,
  onSelect,
  canSelect,
  size = "compact",
}: FormStepperProps) {
  const value = ((index + 1) / labels.length) * 100;
  const comfortable = size === "comfortable";

  return (
    <div className={cn("flex flex-col", comfortable ? "gap-4" : "gap-3")}>
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "font-medium tracking-wide text-muted-foreground uppercase",
            comfortable ? "text-sm" : "text-xs"
          )}
        >
          {progressLabel}
        </p>
      </div>
      <Progress value={value} className={comfortable ? "h-2" : "h-1.5"} />
      <ol className={cn("flex flex-wrap", comfortable ? "gap-3" : "gap-2")}>
        {labels.map((label, stepIndex) => {
          const current = stepIndex === index;
          const done = stepIndex < index;
          const enabled = canSelect ? canSelect(stepIndex) : true;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(stepIndex)}
                className={cn(
                  "rounded-full border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  comfortable
                    ? "min-h-11 px-4 py-2 text-sm"
                    : "min-h-11 px-3.5 text-sm sm:min-h-0 sm:px-3 sm:py-1 sm:text-xs",
                  current &&
                    "border-primary bg-primary text-primary-foreground",
                  done &&
                    "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
                  !current &&
                    !done &&
                    "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <span className="mr-1.5 tabular-nums">{stepIndex + 1}.</span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type FormStepPanelProps = {
  stepKey: string;
  direction: 1 | -1;
  children: ReactNode;
};

export function FormStepPanel({
  stepKey,
  direction,
  children,
}: FormStepPanelProps) {
  return (
    <div className="overflow-hidden">
      <div
        key={stepKey}
        className={cn(
          "animate-in fade-in duration-400 fill-mode-both",
          direction >= 0 ? "slide-in-from-right-8" : "slide-in-from-left-8"
        )}
      >
        {children}
      </div>
    </div>
  );
}
