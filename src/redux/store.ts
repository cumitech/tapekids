import { configureStore } from "@reduxjs/toolkit";

import { persistUiPreferencesMiddleware } from "@/redux/persist";
import { uiPreferencesReducer } from "@/redux/slices/ui-preferences.slice";
import { loadUiPreferences } from "@/redux/ui-preferences-storage";

export const store = configureStore({
  reducer: {
    uiPreferences: uiPreferencesReducer,
  },
  preloadedState:
    typeof window === "undefined"
      ? undefined
      : { uiPreferences: loadUiPreferences() },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistUiPreferencesMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
