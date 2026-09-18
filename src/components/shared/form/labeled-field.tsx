"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/shared/ui/label";

type LabeledFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
};

export function LabeledField({ label, htmlFor, children }: LabeledFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
