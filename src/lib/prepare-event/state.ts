import { isEventType, type EventType } from "@/constants/event-type";

export const PREPARE_EVENT_PATH = "/dashboard/prepare-event";

export const PREPARE_EVENT_STEPS = ["import", "event", "list", "send"] as const;

export type PrepareEventStep = (typeof PREPARE_EVENT_STEPS)[number];

export type PrepareEventState = {
  step: PrepareEventStep;
  eventId: string;
  eventType: EventType | "";
  listId: string;
  batchId: string;
};

const EMPTY_STATE: PrepareEventState = {
  step: "import",
  eventId: "",
  eventType: "",
  listId: "",
  batchId: "",
};

function isStep(value: string | null): value is PrepareEventStep {
  return PREPARE_EVENT_STEPS.includes(value as PrepareEventStep);
}

export function parsePrepareEventSearch(
  params: Pick<URLSearchParams, "get">
): PrepareEventState {
  const step = params.get("step");
  const eventType = params.get("type");
  return resolvePrepareEventState({
    step: isStep(step) ? step : "import",
    eventId: params.get("event")?.trim() ?? "",
    eventType: isEventType(eventType) ? eventType : "",
    listId: params.get("list")?.trim() ?? "",
    batchId: params.get("batch")?.trim() ?? "",
  });
}

export function resolvePrepareEventState(
  input: PrepareEventState
): PrepareEventState {
  let step = input.step;
  if ((step === "list" || step === "send") && !input.eventId) {
    step = "event";
  }
  if (step === "send" && !input.listId) {
    step = input.eventId ? "list" : "event";
  }
  return {
    step,
    eventId: input.eventId,
    eventType: input.eventType,
    listId: input.listId,
    batchId: input.batchId,
  };
}

export function canOpenPrepareStep(
  step: PrepareEventStep,
  state: PrepareEventState
): boolean {
  if (step === "import") {
    return true;
  }
  if (step === "event") {
    return state.step !== "import" || Boolean(state.eventId);
  }
  if (step === "list") {
    return Boolean(state.eventId);
  }
  return Boolean(state.listId);
}

export function previousPrepareStep(step: PrepareEventStep): PrepareEventStep {
  const index = PREPARE_EVENT_STEPS.indexOf(step);
  return PREPARE_EVENT_STEPS[Math.max(0, index - 1)];
}

export function prepareEventPath(state: PrepareEventState): string {
  const resolved = resolvePrepareEventState(state);
  const params = new URLSearchParams();
  if (resolved.step !== "import") {
    params.set("step", resolved.step);
  }
  if (resolved.eventId) {
    params.set("event", resolved.eventId);
  }
  if (resolved.eventType) {
    params.set("type", resolved.eventType);
  }
  if (resolved.listId) {
    params.set("list", resolved.listId);
  }
  if (resolved.batchId) {
    params.set("batch", resolved.batchId);
  }
  const query = params.toString();
  return query ? `${PREPARE_EVENT_PATH}?${query}` : PREPARE_EVENT_PATH;
}

export function emptyPrepareEventState(): PrepareEventState {
  return EMPTY_STATE;
}
