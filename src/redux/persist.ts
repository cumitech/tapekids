import type { Middleware } from "@reduxjs/toolkit";

import { saveUiPreferences } from "@/redux/ui-preferences-storage";
import type { UiPreferencesState } from "@/types/ui-preferences";

type PersistableState = {
  uiPreferences: UiPreferencesState;
};

export const persistUiPreferencesMiddleware: Middleware<object, PersistableState> =
  (storeApi) => (next) => (action) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("uiPreferences/")
    ) {
      saveUiPreferences(storeApi.getState().uiPreferences);
    }

    return result;
  };
