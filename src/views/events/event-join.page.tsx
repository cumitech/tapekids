"use client";

import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@/components/shared/ui/separator";
import { useEventJoinPage } from "@/hooks/events/use-event-join.hook";
import { PublicShell } from "@/views/auth/public-shell";
import { WaitingListJoinForm } from "@/views/waiting-list/waiting-list-join-form";

export function EventJoinPage() {
  const page = useEventJoinPage();
  const { translate, event } = page;

  if (page.phase === "register" && event) {
    return (
      <PublicShell>
        <WaitingListJoinForm
          embedded
          event={{ id: event.eventId, title: event.title }}
          initialYfId={page.yfId}
          onChangeYfId={page.backToAsk}
        />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <AuthFormFrame className="max-w-xl">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary">
            {event?.title || translate("events.titles.show")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {page.phase === "missing"
              ? translate("events.joinPublic.missing")
              : translate("events.joinPublic.prompt")}
          </CardDescription>
        </CardHeader>
        <Separator />
        {page.phase === "loading" ? (
          <p className="text-sm">{translate("events.join.loading")}</p>
        ) : null}
        {page.phase === "ask" ? (
          <form className="flex flex-col gap-4" onSubmit={page.onSubmit}>
            {page.when || page.place ? (
              <p className="text-sm text-muted-foreground">
                {[page.when, page.place].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="join-yf-id">{translate("invite.yfId")}</Label>
              <Input
                id="join-yf-id"
                value={page.yfId}
                autoComplete="off"
                placeholder={translate("invite.yfIdPlaceholder")}
                onChange={(input) => page.setYfId(input.target.value)}
              />
            </div>
            {page.error ? (
              <p className="text-sm text-destructive" role="alert">
                {page.error}
              </p>
            ) : null}
            <Button type="submit" disabled={page.busy}>
              {page.busy
                ? translate("events.joinPublic.checking")
                : translate("events.joinPublic.continue")}
            </Button>
          </form>
        ) : null}
      </AuthFormFrame>
    </PublicShell>
  );
}
