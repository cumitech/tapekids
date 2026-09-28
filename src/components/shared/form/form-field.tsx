"use client";

import type { ReactNode } from "react";

import { RequiredMark } from "@/components/shared/form/required-mark";
import { Label } from "@/components/shared/ui/label";

type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label>
        {label}
        <RequiredMark required={required} />
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
