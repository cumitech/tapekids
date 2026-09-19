"use client";

import { Provider } from "react-redux";
import { useRef, type PropsWithChildren } from "react";

import { hydrateUiPreferences } from "@/redux/slices/ui-preferences.slice";
import { store } from "@/redux/store";
import { loadUiPreferences } from "@/redux/ui-preferences-storage";

export function ReduxProvider({ children }: PropsWithChildren) {
  const hydrated = useRef(false);
  if (typeof window !== "undefined" && !hydrated.current) {
    store.dispatch(hydrateUiPreferences(loadUiPreferences()));
    hydrated.current = true;
  }

  return <Provider store={store}>{children}</Provider>;
}
