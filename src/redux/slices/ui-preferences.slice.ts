import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { defaultUiPreferences } from "@/redux/ui-preferences-storage";
import type { AppLocale } from "@/constants/locales";
import type { ThemeMode, UiPreferencesState } from "@/types/ui-preferences";

const uiPreferencesSlice = createSlice({
  name: "uiPreferences",
  initialState: defaultUiPreferences,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setLocale(state, action: PayloadAction<AppLocale>) {
      state.locale = action.payload;
    },
    hydrateUiPreferences(_state, action: PayloadAction<UiPreferencesState>) {
      return action.payload;
    },
  },
});

export const { setSidebarOpen, setTheme, setLocale, hydrateUiPreferences } =
  uiPreferencesSlice.actions;

export const uiPreferencesReducer = uiPreferencesSlice.reducer;
