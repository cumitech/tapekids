"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useLocale } from "@/hooks/core/use-locale.hook";
import {
  parsePrepareEventSearch,
  prepareEventPath,
  type PrepareEventState,
} from "@/lib/prepare-event/state";

export function usePrepareEvent() {
  const router = useRouter();
  const params = useSearchParams();
  const { path } = useLocale();
  const state = useMemo(() => parsePrepareEventSearch(params), [params]);

  const go = useCallback(
    (patch: Partial<PrepareEventState>) => {
      const next = prepareEventPath({ ...state, ...patch });
      if (next === prepareEventPath(state)) {
        return;
      }
      router.replace(path(next), { scroll: false });
    },
    [path, router, state]
  );

  return { state, go };
}
