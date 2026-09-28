"use client";

import { useTranslate } from "@refinedev/core";

import { InviteAcceptForm } from "@/components/invitations/invite-accept-form";
import { SignInForm } from "@/components/shared/refine-ui/form/sign-in-form";
import { useInviteAcceptance } from "@/hooks/invitations/use-invite-acceptance.hook";
import { PublicShell } from "@/views/auth/public-shell";

export function InvitePage() {
  const translate = useTranslate();
  const invite = useInviteAcceptance();
  const person = invite.payload?.person;
  const name = person?.fullName?.trim() || "";
  const showAcceptForm = invite.needsYfId || invite.needsPassword;
  const showSignIn =
    Boolean(invite.payload) &&
    !invite.needsYfId &&
    !invite.needsPassword &&
    !invite.signedIn;

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">
          {invite.payload?.event?.title ?? translate("invite.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {showSignIn
            ? translate("invite.signInToAccept")
            : invite.needsYfId && invite.needsPassword
              ? translate("invite.enterYfIdAndPassword")
              : invite.needsYfId
                ? translate("invite.enterYfId")
                : translate("invite.completeProfile")}
        </p>
        {name || person?.email ? (
          <p className="text-sm">
            {name ? <span className="font-medium">{name}</span> : null}
            {name && person?.email ? " · " : null}
            {person?.email ? (
              <span className="text-muted-foreground">{person.email}</span>
            ) : null}
          </p>
        ) : null}
        {invite.message ? (
          <p className="text-sm text-muted-foreground">{invite.message}</p>
        ) : null}
        {showAcceptForm ? (
          <InviteAcceptForm
            passwords={invite.passwords}
            yfId={invite.yfId}
            setYfId={invite.setYfId}
            needsYfId={invite.needsYfId}
            needsPassword={invite.needsPassword}
            canSubmit={invite.canSubmit}
            submit={invite.submit}
          />
        ) : null}
        {showSignIn ? (
          <SignInForm
            defaultEmail={person?.email ?? ""}
            redirectTo={invite.invitePath}
          />
        ) : null}
      </div>
    </PublicShell>
  );
}
