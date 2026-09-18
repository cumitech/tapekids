"use client";

import React from "react";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";

import { AppLogoMark } from "@/components/shared/brand/app-logo";
import { APP_NAME } from "@/constants/brand";
import { useRefineResources } from "@/hooks/core/refine-resources.hook";
import { accessControlProvider } from "@/providers/access-control-provider";
import { authProvider } from "@/providers/auth-provider";
import { getAppQueryClient } from "@/lib/client/query-client";
import { dataProvider } from "@/providers/data-provider";
import { i18nProvider } from "@/providers/i18n-provider";
import { liveProvider } from "@/providers/live-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useNotificationProvider } from "@/components/shared/refine-ui/notification/use-notification-provider";
import { Toaster } from "@/components/shared/refine-ui/notification/toaster";
import "@/app/globals.css";

type RefineContextProps = {
  children: React.ReactNode;
};

export const RefineContext = ({ children }: RefineContextProps) => {
  const notificationProvider = useNotificationProvider();
  const resources = useRefineResources();

  return (
    <ReduxProvider>
      <RefineKbarProvider>
        <ThemeProvider>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            accessControlProvider={accessControlProvider}
            {...(liveProvider ? { liveProvider } : {})}
            notificationProvider={notificationProvider}
            routerProvider={routerProvider}
            resources={resources}
            options={{
              title: {
                icon: <AppLogoMark className="size-9 text-primary" />,
                text: APP_NAME,
              },
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              reactQuery: {
                clientConfig: getAppQueryClient(),
              },
            }}
          >
            {children}
            <Toaster />
            <RefineKbar />
          </Refine>
        </ThemeProvider>
      </RefineKbarProvider>
    </ReduxProvider>
  );
};
