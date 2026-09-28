"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslate } from "@refinedev/core";
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
import { PERSON_FORM_STEPS } from "@/constants/person-form-steps";
import { usePersonFormSteps } from "@/hooks/people/use-person-form-steps.hook";
import { emptyPersonForm, personFormToPayload } from "@/models/people/person.model";
import type { PersonFormValues } from "@/types/forms";
import { http } from "@/utils/axios";
import { PublicShell } from "@/views/auth/public-shell";

export function WaitingListJoinPage() {
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const form = useForm<PersonFormValues>({ defaultValues: emptyPersonForm });
  const steps = usePersonFormSteps(form.trigger, true);
  const stepLabels = PERSON_FORM_STEPS.map((name) =>
    translate(`people.sections.${name}`)
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!steps.isLast) {
      await steps.goNext();
      return;
    }
    const valid = await form.trigger();
    if (!valid) {
      return;
    }

    setBusy(true);
    try {
      await http.post("/waiting-list", personFormToPayload(form.getValues()));
      setDone(true);
    } catch (cause) {
      setError(messageFromError(cause, translate("waitingList.registerFailed")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <AuthFormFrame className="max-w-6xl">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
            {translate("waitingList.joinTitle")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {translate("waitingList.joinDescription")}
          </CardDescription>
        </CardHeader>
        <Separator />
        {done ? (
          <p className="font-serif text-base leading-relaxed">
            {translate("waitingList.submitted")}
          </p>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <FormStepper
              size="comfortable"
              labels={stepLabels}
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
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
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
                <Button type="submit" disabled={busy}>
                  {busy
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
    </PublicShell>
  );
}

function messageFromError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message && message !== "Validation failed") {
      return message;
    }
  }
  return fallback;
}
