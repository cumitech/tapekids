"use client";

import Link from "next/link";
import { useTranslate } from "@refinedev/core";
import { ListChecks } from "lucide-react";

import { InvitationQueueForm } from "@/components/invitations/invitation-queue-form";
import { Button } from "@/components/shared/ui/button";
import { usePrepareSendStep } from "@/hooks/prepare-event/use-prepare-event.hook";
import type { PrepareEventState } from "@/lib/prepare-event/state";
import { StepActions } from "@/views/prepare-event/step-actions";

export function SendStep({
  state,
  go,
}: {
  state: PrepareEventState;
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();
  const send = usePrepareSendStep(state);

  if (state.batchId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <ListChecks className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">
              {translate("prepareEvent.doneTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {translate("prepareEvent.doneBody")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href={send.eventHref}>
              {translate("prepareEvent.openEvent")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={send.listHref}>
              {translate("prepareEvent.openList")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={send.busy}
            onClick={() => void send.resend()}
          >
            {translate("prepareEvent.resend")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => go({ batchId: "" })}
          >
            {translate("prepareEvent.another")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InvitationQueueForm
        key={`${state.listId}-${state.eventId}`}
        mailingListId={state.listId}
        eventId={state.eventId}
        lockEvent
        onSent={(result) => {
          const batchId = result.batch?.id;
          if (batchId) {
            go({ batchId });
          }
        }}
      />
      <StepActions onBack={() => go({ step: "list" })} />
    </div>
  );
}
