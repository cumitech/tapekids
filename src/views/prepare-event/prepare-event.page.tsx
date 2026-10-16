"use client";

import { useTranslate } from "@refinedev/core";

import { FormStepper } from "@/components/shared/form/form-stepper";
import { PageHeader } from "@/components/shared/refine-ui/layout/page-header";
import { PORTAL_SURFACE } from "@/constants/layout";
import { usePrepareEvent } from "@/hooks/prepare-event/use-prepare-event.hook";
import {
  PREPARE_EVENT_STEPS,
  canOpenPrepareStep,
} from "@/lib/prepare-event/state";
import { cn } from "@/lib/utils";
import { EventStep } from "@/views/prepare-event/event-step";
import { ImportStep } from "@/views/prepare-event/import-step";
import { ListStep } from "@/views/prepare-event/list-step";
import { SendStep } from "@/views/prepare-event/send-step";

export function PrepareEventPage() {
  const translate = useTranslate();
  const { state, go } = usePrepareEvent();
  const labels = PREPARE_EVENT_STEPS.map((step) =>
    translate(`prepareEvent.steps.${step}`)
  );
  const index = PREPARE_EVENT_STEPS.indexOf(state.step);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={translate("prepareEvent.title")} showBack />
      <FormStepper
        labels={labels}
        index={index}
        size="comfortable"
        progressLabel={translate("prepareEvent.progress", {
          step: index + 1,
          total: PREPARE_EVENT_STEPS.length,
        })}
        canSelect={(stepIndex) =>
          canOpenPrepareStep(PREPARE_EVENT_STEPS[stepIndex], state)
        }
        onSelect={(stepIndex) => go({ step: PREPARE_EVENT_STEPS[stepIndex] })}
      />
      <div className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card md:p-6")}>
        {state.step === "import" ? <ImportStep go={go} /> : null}
        {state.step === "event" ? <EventStep state={state} go={go} /> : null}
        {state.step === "list" ? <ListStep state={state} go={go} /> : null}
        {state.step === "send" ? <SendStep state={state} go={go} /> : null}
      </div>
    </section>
  );
}
