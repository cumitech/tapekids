"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { apiGet } from "@/lib/client/api";
import { isPersonProfileComplete } from "@/lib/people/profile-completeness";
import type { MeProfile } from "@/models/me/me.model";

type MeState = {
  profile: MeProfile | null;
  loading: boolean;
  profileComplete: boolean;
  reload: () => Promise<void>;
};

const MeContext = createContext<MeState | null>(null);

function useMeState(enabled: boolean): MeState {
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(enabled);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const reload = useCallback(async () => {
    const hadProfile = Boolean(profileRef.current);
    if (!hadProfile) {
      setLoading(true);
    }
    try {
      const data = await apiGet<MeProfile>("/me");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void reload();
  }, [enabled, reload]);

  return useMemo(
    () => ({
      profile,
      loading,
      profileComplete: isPersonProfileComplete(profile?.person),
      reload,
    }),
    [loading, profile, reload]
  );
}

export function MeProvider({ children }: PropsWithChildren) {
  const value = useMeState(true);
  return createElement(MeContext.Provider, { value }, children);
}

export function useMe() {
  const context = useContext(MeContext);
  const standalone = useMeState(context === null);
  return context ?? standalone;
}
