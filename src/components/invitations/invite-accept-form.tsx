"use client";

import { useTranslate } from "@refinedev/core";

import { PasswordConfirmFields } from "@/components/shared/form/password-confirm-fields";
import { Button } from "@/components/shared/ui/button";
import type { useInviteAcceptance } from "@/hooks/invitations/use-invite-acceptance.hook";

type InviteAcceptFormProps = Pick<
  ReturnType<typeof useInviteAcceptance>,
  "passwords" | "canSubmit" | "submit"
>;

export function InviteAcceptForm({
  passwords,
  canSubmit,
  submit,
}: InviteAcceptFormProps) {
  const translate = useTranslate();

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <PasswordConfirmFields
        idPrefix="invite"
        passwordLabel={translate("invite.createPassword")}
        password={passwords.password}
        confirmPassword={passwords.confirmPassword}
        onPasswordChange={passwords.setPassword}
        onConfirmChange={passwords.setConfirmPassword}
      />
      <Button type="submit" disabled={!canSubmit}>
        {translate("invite.accept")}
      </Button>
    </form>
  );
}
