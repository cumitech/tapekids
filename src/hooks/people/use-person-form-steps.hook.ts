"use client";

import { useCallback, useRef, useState } from "react";
import type { UseFormTrigger } from "react-hook-form";

import {
  PERSON_FORM_STEPS,
  PERSON_STEP_FIELD_PATHS,
  type PersonFormStep,
} from "@/constants/person-form-steps";
import type { PersonFormValues } from "@/types/forms";

export function usePersonFormSteps(
  trigger: UseFormTrigger<PersonFormValues>,
  enabled: boolean
) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const indexRef = useRef(0);
  indexRef.current = index;
  const total = PERSON_FORM_STEPS.length;
  const step = PERSON_FORM_STEPS[index] as PersonFormStep;

  const moveTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), total - 1);
      const current = indexRef.current;
      if (clamped === current) {
        return;
      }
      setDirection(clamped > current ? 1 : -1);
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [total]
  );

  const goTo = useCallback(
    async (target: number) => {
      if (!enabled) {
        return true;
      }
      const clamped = Math.min(Math.max(target, 0), total - 1);
      const current = indexRef.current;
      if (clamped <= current) {
        moveTo(clamped);
        return true;
      }
      for (let i = current; i < clamped; i += 1) {
        const valid = await trigger(
          PERSON_STEP_FIELD_PATHS[PERSON_FORM_STEPS[i] as PersonFormStep]
        );
        if (!valid) {
          moveTo(i);
          return false;
        }
      }
      moveTo(clamped);
      return true;
    },
    [enabled, moveTo, total, trigger]
  );

  const goBack = useCallback(() => {
    void goTo(indexRef.current - 1);
  }, [goTo]);

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);

  return {
    step,
    index,
    direction,
    total,
    isFirst: index === 0,
    isLast: index === total - 1,
    goTo,
    goBack,
    goNext,
  };
}
