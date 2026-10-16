"use client";

import { useTranslate } from "@refinedev/core";

import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { Button } from "@/components/shared/ui/button";
import {
  listSavedPatch,
  mailingListDefaults,
} from "@/hooks/prepare-event/use-prepare-event.hook";
import {
  previousPrepareStep,
  type PrepareEventState,
} from "@/lib/prepare-event/state";
import { StepActions } from "@/views/prepare-event/step-actions";

export function ListStep({
  state,
  go,
}: {
  state: PrepareEventState;
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-4">
      {state.listId ? (
        <StepActions onBack={() => go({ step: "event" })}>
          <Button type="button" onClick={() => go({ step: "send" })}>
            {translate("prepareEvent.continue")}
          </Button>
        </StepActions>
      ) : null}
      <MailingListForm
        key={state.listId || "new"}
        mode={state.listId ? "edit" : "create"}
        id={state.listId || undefined}
        preferredEventId={state.eventId || undefined}
        defaults={mailingListDefaults(state)}
        onCancel={() => go({ step: previousPrepareStep("list") })}
        onSuccess={(record) => {
          const patch = listSavedPatch(record);
          if (patch) {
            go(patch);
          }
        }}
      />
    </div>
  );
}
