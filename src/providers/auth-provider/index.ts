import type { AuthProvider } from "@refinedev/core";

import { withLocalePath } from "@/lib/locale";
import { safeInternalPath } from "@/lib/navigation/safe-path";
import { rolesFromUnknown } from "@/lib/permissions";
import {
  clearSession,
  getSession,
  setSession,
  type AuthSession,
} from "@/utils/auth-storage";
import { http } from "@/utils/axios";
import { getClientLocale } from "@/utils/locale-cookie";

function localizedPath(path: string) {
  return withLocalePath(getClientLocale(), path);
}

type LoginParams = {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  providerName?: string;
  remember?: boolean;
  redirect?: string;
};

type AuthEnvelope = {
  data?: AuthSession;
  message?: string;
};

function isSession(payload: AuthEnvelope | AuthSession): payload is AuthSession {
  return "token" in payload && typeof payload.token === "string";
}

function sessionFromResponse(payload: AuthEnvelope | AuthSession): AuthSession {
  if (isSession(payload)) {
    return payload;
  }
  if (payload.data?.token) {
    return payload.data;
  }
  throw new Error(payload.message || "Authentication failed");
}

export const authProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    const email = params.email?.trim();
    const password = params.password;
    if (!email || !password) {
      return {
        success: false,
        error: { name: "LoginError", message: "Email and password are required." },
      };
    }

    try {
      const { data } = await http.post<AuthEnvelope>("/auth/login", { email, password });
      setSession(sessionFromResponse(data), { remember: params.remember !== false });
      return {
        success: true,
        redirectTo: safeInternalPath(params.redirect, localizedPath("/dashboard")),
      };
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Invalid email or password.";
      return {
        success: false,
        error: { name: "LoginError", message },
      };
    }
  },
  register: async (params: LoginParams) => {
    const email = params.email?.trim();
    const password = params.password;
    const username = params.username?.trim() || email?.split("@")[0];
    if (!email || !password || !username) {
      return {
        success: false,
        error: { name: "RegisterError", message: "Email, username, and password are required." },
      };
    }

    try {
      const { data } = await http.post<AuthEnvelope>("/auth/register", {
        email,
        username,
        password,
        confirmPassword: params.confirmPassword || password,
      });
      setSession(sessionFromResponse(data), { remember: true });
      return {
        success: true,
        redirectTo: localizedPath("/dashboard"),
      };
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not create the account.";
      return {
        success: false,
        error: { name: "RegisterError", message },
      };
    }
  },
  forgotPassword: async (params: LoginParams) => {
    const email = params.email?.trim();
    if (!email) {
      return {
        success: false,
        error: { name: "ForgotPasswordError", message: "Email is required." },
      };
    }
    try {
      await http.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not send the reset email.";
      return {
        success: false,
        error: { name: "ForgotPasswordError", message },
      };
    }
  },
  logout: async () => {
    clearSession();
    const redirectTo = localizedPath("/login");
    return {
      success: true,
      redirectTo,
    };
  },
  check: async () => {
    if (typeof window === "undefined") {
      return { authenticated: false };
    }
    const session = getSession();
    if (!session?.token) {
      return {
        authenticated: false,
        redirectTo: localizedPath("/login"),
      };
    }

    return { authenticated: true };
  },
  onError: async (error) => {
    const status = (error as { statusCode?: number })?.statusCode;
    if (status === 401 || status === 403) {
      return {
        logout: true,
        redirectTo: localizedPath("/login"),
      };
    }

    return { error: error as Error };
  },
  getIdentity: async () => {
    const session = getSession();
    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      roles: session.user.roles,
      personId: session.user.personId ?? null,
    };
  },
  getPermissions: async () => {
    return rolesFromUnknown(getSession()?.user.roles);
  },
};
