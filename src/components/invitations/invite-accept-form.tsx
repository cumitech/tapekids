"use client";

import { useTranslate } from "@refinedev/core";

import { PasswordConfirmFields } from "@/components/shared/form/password-confirm-fields";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { RequiredMark } from "@/components/shared/form/required-mark";
import { Label } from "@/components/shared/ui/label";
import type { useInviteAcceptance } from "@/hooks/invitations/use-invite-acceptance.hook";

type InviteAcceptFormProps = Pick<
  ReturnType<typeof useInviteAcceptance>,
  | "passwords"
  | "yfId"
  | "setYfId"
  | "needsYfId"
  | "needsPassword"
  | "canSubmit"
  | "submit"
>;

export function InviteAcceptForm({
  passwords,
  yfId,
  setYfId,
  needsYfId,
  needsPassword,
  canSubmit,
  submit,
}: InviteAcceptFormProps) {
  const translate = useTranslate();

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      {needsYfId ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-yf-id">
            {translate("invite.yfId")}
            <RequiredMark required />
          </Label>
          <Input
            id="invite-yf-id"
            inputMode="numeric"
            autoComplete="off"
            placeholder={translate("invite.yfIdPlaceholder")}
            value={yfId}
            onChange={(event) => setYfId(event.target.value)}
          />
        </div>
      ) : null}
      {needsPassword ? (
        <PasswordConfirmFields
          idPrefix="invite"
          passwordLabel={translate("invite.createPassword")}
          password={passwords.password}
          confirmPassword={passwords.confirmPassword}
          onPasswordChange={passwords.setPassword}
          onConfirmChange={passwords.setConfirmPassword}
        />
      ) : null}
      <Button type="submit" disabled={!canSubmit}>
        {translate("invite.accept")}
      </Button>
    </form>
  );
}
