"use client";

import type { BaseKey } from "@refinedev/core";

import { useResourceForm } from "@/hooks/core/use-resource-form.hook";
import {
  emptyEventForm,
  eventFormToPayload,
  eventToFormValues,
  type Event,
} from "@/models/events/event.model";
import type { EventFormValues } from "@/types/forms";

type UseEventFormParams = {
  mode: "create" | "edit";
  id?: BaseKey;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function useEventForm({
  mode,
  id,
  onCancel,
  onSuccess,
}: UseEventFormParams) {
  return useResourceForm<
    Event,
    EventFormValues,
    ReturnType<typeof eventFormToPayload>
  >({
    resource: "events",
    mode,
    id,
    emptyValues: emptyEventForm,
    toFormValues: eventToFormValues,
    toPayload: eventFormToPayload,
    onCancel,
    onSuccess,
  });
}
