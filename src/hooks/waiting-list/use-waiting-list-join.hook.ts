"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslate } from "@refinedev/core";

import { PERSON_FORM_STEPS } from "@/constants/person-form-steps";
import { usePersonFormSteps } from "@/hooks/people/use-person-form-steps.hook";
import { emptyPersonForm, personFormToPayload } from "@/models/people/person.model";
import type { PersonFormValues } from "@/types/forms";
import { http } from "@/utils/axios";

export type WaitingListJoinEvent = { id: string; title: string };

export function useWaitingListJoinForm({
  event,
  initialYfId = "",
}: {
  event?: WaitingListJoinEvent;
  initialYfId?: string;
}) {
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const form = useForm<PersonFormValues>({
    defaultValues: { ...emptyPersonForm, yfId: initialYfId },
  });
  const steps = usePersonFormSteps(form.trigger, true);
  const stepLabels = PERSON_FORM_STEPS.map((name) =>
    translate(`people.sections.${name}`)
  );

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
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
      const payload = personFormToPayload(form.getValues());
      await http.post("/waiting-list", {
        ...payload,
        yfId: initialYfId || payload.yfId,
        ...(event ? { eventId: event.id, eventTitle: event.title } : {}),
      });
      setDone(true);
    } catch (cause) {
      setError(messageFromError(cause, translate("waitingList.registerFailed")));
    } finally {
      setBusy(false);
    }
  }

  return {
    translate,
    form,
    steps,
    stepLabels,
    busy,
    error,
    done,
    onSubmit,
  };
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
