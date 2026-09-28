"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useList, useTranslate } from "@refinedev/core";
import { ListChecks } from "lucide-react";

import { EventForm } from "@/components/events/event-form.component";
import { InvitationQueueForm } from "@/components/invitations/invitation-queue-form";
import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { PeopleImportForm } from "@/components/people/people-import-form";
import { FormStepper } from "@/components/shared/form/form-stepper";
import { PageHeader } from "@/components/shared/refine-ui/layout/page-header";
import { Button } from "@/components/shared/ui/button";
import { PORTAL_SURFACE } from "@/constants/layout";
import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";
import { isEventType } from "@/constants/event-type";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { usePrepareEvent } from "@/hooks/prepare-event/use-prepare-event.hook";
import { invitationDeliveryNotice } from "@/lib/invitations/delivery-notice";
import { sendInvitationBatch } from "@/lib/invitations/send-batch";
import type { PeopleImportResult } from "@/models/people/people-import.model";
import {
  PREPARE_EVENT_STEPS,
  canOpenPrepareStep,
  previousPrepareStep,
  type PrepareEventState,
} from "@/lib/prepare-event/state";
import { cn } from "@/lib/utils";

const LIST_DEFAULTS = {
  audienceKind: MAILING_LIST_AUDIENCE_KINDS.CAMPER,
};

function directoryTotal(query: {
  data?: { total?: number };
  result?: { total?: number };
}) {
  return query.result?.total ?? query.data?.total ?? 0;
}

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

function StepActions({
  onBack,
  children,
}: {
  onBack?: () => void;
  children?: ReactNode;
}) {
  const translate = useTranslate();
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          {translate("prepareEvent.back")}
        </Button>
      ) : null}
      {children}
    </div>
  );
}

function ImportStep({
  go,
}: {
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();
  const [imported, setImported] = useState(false);
  const { query } = useList({
    resource: "people",
    pagination: { currentPage: 1, pageSize: 1 },
    queryOptions: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
  const hasPeople = directoryTotal(query) > 0;
  const canContinue = !query.isLoading && (hasPeople || imported);

  return (
    <div className="flex flex-col gap-4">
      <PeopleImportForm
        onImported={(result: PeopleImportResult) => {
          if (result.created + result.updated + result.unchanged > 0) {
            setImported(true);
          }
        }}
      />
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

function EventStep({
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
        onSuccess={(record) => {
          go({
            step: "list",
            eventId: record.id,
            eventType: isEventType(record.eventType)
              ? record.eventType
              : state.eventType,
          });
        }}
      />
    </div>
  );
}

function ListStep({
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
        defaults={state.listId ? undefined : LIST_DEFAULTS}
        onCancel={() => go({ step: previousPrepareStep("list") })}
        onSuccess={(record) => {
          if (!record.id) {
            return;
          }
          go({ step: "send", listId: record.id });
        }}
      />
    </div>
  );
}

function SendStep({
  state,
  go,
}: {
  state: PrepareEventState;
  go: (patch: Partial<PrepareEventState>) => void;
}) {
  const translate = useTranslate();
  const { path } = useLocale();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();

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
            <Link href={path(`/dashboard/events/show/${state.eventId}`)}>
              {translate("prepareEvent.openEvent")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={path(`/dashboard/mailing-lists/show/${state.listId}`)}>
              {translate("prepareEvent.openList")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const payload = await sendInvitationBatch(state.batchId);
                notify?.(
                  invitationDeliveryNotice(
                    payload,
                    integrations.mailEnabled,
                    translate
                  )
                );
              }, translate("mailingLists.invitationsSendFailed"))
            }
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
