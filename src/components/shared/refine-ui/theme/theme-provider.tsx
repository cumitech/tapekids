"use client";

import { createContext, useContext, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setTheme as setThemePreference } from "@/redux/slices/ui-preferences.slice";
import type { ThemeMode } from "@/types/ui-preferences";

export type Theme = ThemeMode;

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const theme = useAppSelector((state) => state.uiPreferences.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value: ThemeProviderState = {
    theme,
    setTheme: (nextTheme: Theme) => {
      dispatch(setThemePreference(nextTheme));
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

ThemeProvider.displayName = "ThemeProvider";
