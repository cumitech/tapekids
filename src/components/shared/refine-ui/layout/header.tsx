"use client";

import { useTranslate } from "@refinedev/core";

import { Breadcrumb } from "@/components/shared/refine-ui/layout/breadcrumb";
import { HeaderTools } from "@/components/shared/refine-ui/layout/header-tools";
import { LayoutHeaderBar } from "@/components/shared/refine-ui/layout/layout-header-bar";
import { Separator } from "@/components/shared/ui/separator";
import { SidebarTrigger } from "@/components/shared/ui/sidebar";
import { hasRole, USER_ROLES } from "@/constants/user-roles";
import { useSessionRoles } from "@/hooks/core/use-session-roles.hook";

export const Header = () => {
  const translate = useTranslate();
  const { roles } = useSessionRoles();
  const isAdmin = hasRole(roles, USER_ROLES.ADMIN);
  const roleLabel = translate(
    isAdmin ? "dashboard.roleAdmin" : "dashboard.roleStaff"
  );

  return (
    <LayoutHeaderBar className="overflow-x-clip">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6">
        <SidebarTrigger
          className="-ml-1 shrink-0 text-foreground"
          aria-label={translate("a11y.toggleSidebar")}
        />
        <Separator
          orientation="vertical"
          className="mr-1 hidden bg-border data-[orientation=vertical]:h-4 sm:block"
        />
        <div className="min-w-0 overflow-hidden">
          <Breadcrumb />
        </div>
        <span
          className={
            isAdmin
              ? "hidden shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary sm:inline"
              : "hidden shrink-0 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary sm:inline"
          }
        >
          {roleLabel}
        </span>
      </div>
      <HeaderTools className="px-2 sm:gap-2 sm:px-4 md:px-6" />
    </LayoutHeaderBar>
  );
};

Header.displayName = "Header";
