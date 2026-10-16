"use client";

import { useTranslate } from "@refinedev/core";

import { EventForm } from "@/components/events/event-form.component";
import { Button } from "@/components/shared/ui/button";
import { eventSavedPatch } from "@/hooks/prepare-event/use-prepare-event.hook";
import {
  previousPrepareStep,
  type PrepareEventState,
} from "@/lib/prepare-event/state";
import { StepActions } from "@/views/prepare-event/step-actions";

export function EventStep({
  state,
  go,
}: {
  state: PrepareEventState;
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-4">
      {state.eventId ? (
        <StepActions onBack={() => go({ step: "import" })}>
          <Button type="button" onClick={() => go({ step: "list" })}>
            {translate("prepareEvent.continue")}
          </Button>
        </StepActions>
      ) : null}
      <EventForm
        key={state.eventId || "new"}
        mode={state.eventId ? "edit" : "create"}
        id={state.eventId || undefined}
        onCancel={() => go({ step: previousPrepareStep("event") })}
        onSuccess={(record) => go(eventSavedPatch(state, record))}
      />
    </div>
  );
}
