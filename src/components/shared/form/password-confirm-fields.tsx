"use client";

import { useTranslate } from "@refinedev/core";

import { InputPassword } from "@/components/shared/refine-ui/form/input-password";
import { LabeledField } from "@/components/shared/form/labeled-field";
import { PASSWORD_MIN_LENGTH } from "@/data/dtos/password.dto";

type PasswordConfirmFieldsProps = {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  passwordLabel?: string;
  idPrefix?: string;
};

export function PasswordConfirmFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmChange,
  passwordLabel,
  idPrefix = "password",
}: PasswordConfirmFieldsProps) {
  const translate = useTranslate();
  const passwordId = `${idPrefix}-password`;
  const confirmId = `${idPrefix}-confirm`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LabeledField
        htmlFor={passwordId}
        label={passwordLabel ?? translate("auth.password")}
      >
        <InputPassword
          id={passwordId}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />
      </LabeledField>
      <LabeledField
        htmlFor={confirmId}
        label={translate("auth.confirmPassword")}
      >
        <InputPassword
          id={confirmId}
          value={confirmPassword}
          onChange={(event) => onConfirmChange(event.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />
      </LabeledField>
    </div>
  );
}
