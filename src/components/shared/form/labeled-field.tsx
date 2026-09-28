"use client";

import type { ReactNode } from "react";

import { RequiredMark } from "@/components/shared/form/required-mark";
import { Label } from "@/components/shared/ui/label";

type LabeledFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
};

export function LabeledField({
  label,
  htmlFor,
  required,
  children,
}: LabeledFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        <RequiredMark required={required} />
      </Label>
      {children}
    </div>
  );
}
