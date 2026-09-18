"use client";

import { useNotification } from "@refinedev/core";
import { useState } from "react";

import { apiErrorMessage } from "@/lib/client/api";

export function useBusyAction() {
  const { open } = useNotification();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, errorFallback: string) {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      open?.({
        type: "error",
        message: apiErrorMessage(error, errorFallback),
      });
    } finally {
      setBusy(false);
    }
  }

  return { busy, run, notify: open };
}
