"use client";

import type { PropsWithChildren } from "react";

import { Header } from "@/components/shared/refine-ui/layout/header";
import { ResourceRouteGuard } from "@/components/shared/refine-ui/layout/resource-route-guard";
import { Sidebar } from "@/components/shared/refine-ui/layout/sidebar";
import { AppFooter } from "@/components/shared/layout/app-footer";
import { AppModalProvider } from "@/components/shared/modals/app-modal";
import { SidebarInset, SidebarProvider } from "@/components/shared/ui/sidebar";
import { useRoleFlags } from "@/hooks/core/use-session-roles.hook";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSidebarOpen } from "@/redux/slices/ui-preferences.slice";
import { cn } from "@/lib/utils";

export function Layout({ children }: PropsWithChildren) {
  const sidebarOpen = useAppSelector((state) => state.uiPreferences.sidebarOpen);
  const dispatch = useAppDispatch();
  const { isStaff } = useRoleFlags();
  const shellBg = isStaff
    ? "bg-[#e8eeed] dark:bg-background"
    : "bg-muted/40";

  return (
    <AppModalProvider>
      <SidebarProvider
        className={cn("min-w-0 overflow-x-clip", shellBg)}
        open={sidebarOpen}
        onOpenChange={(open) => dispatch(setSidebarOpen(open))}
      >
        <Sidebar />
        <SidebarInset className={cn("min-w-0 overflow-x-clip", shellBg)}>
          <Header />
          <div className={cn("flex min-w-0 flex-1 flex-col overflow-x-clip", shellBg)}>
            <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
              <ResourceRouteGuard>{children}</ResourceRouteGuard>
            </div>
            <AppFooter />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppModalProvider>
  );
}

Layout.displayName = "Layout";
