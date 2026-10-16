"use client";

import { useTranslate } from "@refinedev/core";

import { PeopleImportForm } from "@/components/people/people-import-form";
import { Button } from "@/components/shared/ui/button";
import { usePrepareImportStep } from "@/hooks/prepare-event/use-prepare-event.hook";
import type { PrepareEventState } from "@/lib/prepare-event/state";
import { StepActions } from "@/views/prepare-event/step-actions";

export function ImportStep({
  go,
}: {
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();
  const { canContinue, markImported } = usePrepareImportStep();

  return (
    <div className="flex flex-col gap-4">
      <PeopleImportForm onImported={markImported} />
      <StepActions>
        <Button
          type="button"
          disabled={!canContinue}
          onClick={() => go({ step: "event" })}
        >
          {translate("prepareEvent.continue")}
        </Button>
      </StepActions>
    </div>
  );
}
