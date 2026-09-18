"use client";

import type { ReactNode } from "react";

import { Progress } from "@/components/shared/ui/progress";
import { cn } from "@/lib/utils";

type FormStepperProps = {
  labels: string[];
  index: number;
  progressLabel: string;
  onSelect: (index: number) => void;
};

export function FormStepper({
  labels,
  index,
  progressLabel,
  onSelect,
}: FormStepperProps) {
  const value = ((index + 1) / labels.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {progressLabel}
        </p>
      </div>
      <Progress value={value} className="h-1.5" />
      <ol className="flex flex-wrap gap-2">
        {labels.map((label, stepIndex) => {
          const current = stepIndex === index;
          const done = stepIndex < index;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onSelect(stepIndex)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
