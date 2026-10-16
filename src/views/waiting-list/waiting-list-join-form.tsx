"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { PersonFields } from "@/components/people/person-fields";
import { FormStepper } from "@/components/shared/form/form-stepper";
import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import {
  useWaitingListJoinForm,
  type WaitingListJoinEvent,
} from "@/hooks/waiting-list/use-waiting-list-join.hook";
import { PublicShell } from "@/views/auth/public-shell";

export function WaitingListJoinForm({
  embedded = false,
  event,
  initialYfId = "",
  onChangeYfId,
}: {
  embedded?: boolean;
  event?: WaitingListJoinEvent;
  initialYfId?: string;
  onChangeYfId?: () => void;
} = {}) {
  const page = useWaitingListJoinForm({ event, initialYfId });
  const { translate, form, steps } = page;

  if (!event) {
    const missing = (
      <AuthFormFrame className="max-w-xl">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
            {translate("waitingList.joinTitle")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {translate("events.joinPublic.missing")}
          </CardDescription>
        </CardHeader>
      </AuthFormFrame>
    );
    return embedded ? missing : <PublicShell>{missing}</PublicShell>;
  }

  const frame = (
    <AuthFormFrame className="max-w-6xl">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
          {translate("waitingList.joinTitle")}
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          {translate("waitingList.forEvent", { title: event.title })}
        </CardDescription>
      </CardHeader>
      <Separator />
      {page.done ? (
        <p className="font-serif text-base leading-relaxed">
          {translate("waitingList.submitted")}
        </p>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={page.onSubmit}>
          {onChangeYfId ? (
            <p className="text-sm text-muted-foreground">
              {translate("events.joinPublic.notFound")}
            </p>
          ) : null}
          {onChangeYfId ? (
            <Button type="button" variant="outline" onClick={onChangeYfId}>
              {translate("waitingList.changeYfId")}
            </Button>
          ) : null}
          <FormStepper
            size="comfortable"
            labels={page.stepLabels}
            index={steps.index}
            progressLabel={translate("people.steps.progress", {
              current: steps.index + 1,
              total: steps.total,
            })}
            onSelect={(next) => {
              void steps.goTo(next);
            }}
          />
          <PersonFields
            layout="full"
            section={steps.step}
            keepMounted
            direction={steps.direction}
            register={form.register}
            control={form.control}
            errors={form.formState.errors}
            watch={form.watch}
            setValue={form.setValue}
            emailRequired
            requireComplete
            showDirectoryFields={false}
          />
          {page.error ? (
            <p className="text-sm text-destructive" role="alert">
              {page.error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {!steps.isFirst ? (
              <Button type="button" variant="outline" onClick={steps.goBack}>
                <ChevronLeft />
                {translate("people.steps.back")}
              </Button>
            ) : (
              <span />
            )}
            {steps.isLast ? (
              <Button type="submit" disabled={page.busy}>
                {page.busy
                  ? translate("waitingList.submitting")
                  : translate("waitingList.submit")}
              </Button>
            ) : (
              <Button type="button" onClick={() => void steps.goNext()}>
                {translate("people.steps.next")}
                <ChevronRight />
              </Button>
            )}
          </div>
        </form>
      )}
    </AuthFormFrame>
  );

  if (embedded) {
    return frame;
  }

  return <PublicShell>{frame}</PublicShell>;
}
