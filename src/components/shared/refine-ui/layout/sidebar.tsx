"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  useMenu,
  useLink,
  useTranslate,
  type TreeMenuItem,
} from "@refinedev/core";
import {
  SidebarRail as ShadcnSidebarRail,
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarHeader as ShadcnSidebarHeader,
  useSidebar as useShadcnSidebar,
} from "@/components/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shared/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import { AppLogo } from "@/components/shared/brand/app-logo";
import { Button } from "@/components/shared/ui/button";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useRoleFlags, useSessionRoles } from "@/hooks/core/use-session-roles.hook";
import { LAYOUT_CHROME_BG, LAYOUT_HEADER_SHADOW, LAYOUT_SIDEBAR_BODY_SHADOW } from "@/constants/layout";
import { canPerform } from "@/lib/permissions";
import { isAdminRole } from "@/constants/user-roles";
import {
  REPORT_KIND_VALUES,
  REPORT_KINDS,
  type ReportKind,
} from "@/constants/reports";
import {
  ChevronRight,
  ClipboardList,
  Handshake,
  ListIcon,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REPORT_MENU_ICONS: Record<ReportKind, LucideIcon> = {
  [REPORT_KINDS.TROPHY_CAMPERS]: Trophy,
  [REPORT_KINDS.TROPHY_PARTICIPANTS]: Users,
  [REPORT_KINDS.CHAPERONES]: UserCheck,
  [REPORT_KINDS.SPONSORS]: Handshake,
  [REPORT_KINDS.PARTICIPANTS]: Users,
  [REPORT_KINDS.WAITING_LIST]: ClipboardList,
};

function filterMenuItems(
  items: TreeMenuItem[],
  roles: readonly string[]
): TreeMenuItem[] {
  const visible: TreeMenuItem[] = [];

  for (const item of items) {
    if (item.children?.length) {
      const children = filterMenuItems(item.children, roles);
      if (children.length) {
        visible.push({ ...item, children });
      }
      continue;
    }

    if (
      canPerform({
        roles,
        resource: item.name ?? "",
        action: "list",
      })
    ) {
      visible.push(item);
    }
  }

  return visible;
}

const HIDDEN_NAV = new Set(["profile", "camp", "sponsorships", "me"]);

function takeItem(items: TreeMenuItem[], name: string) {
  return items.find((item) => item.name === name);
}

function navGroup(
  key: string,
  label: string,
  children: TreeMenuItem[]
): TreeMenuItem {
  return {
    key,
    name: key,
    meta: { group: true, label },
    children,
  } as unknown as TreeMenuItem;
}

function pickItems(items: TreeMenuItem[], names: string[]) {
  const found: TreeMenuItem[] = [];
  for (const name of names) {
    const item = takeItem(items, name);
    if (item) {
      found.push(item);
    }
  }
  return found;
}

function normalizePath(value: string) {
  const path = value.split("?")[0]?.split("#")[0]?.replace(/\/$/, "");
  return path || "/";
}

function isMenuItemSelected(
  item: TreeMenuItem,
  selectedKey: string | undefined,
  pathname: string
) {
  if (selectedKey && item.key === selectedKey) {
    return true;
  }
  if (!item.route) {
    return false;
  }
  return normalizePath(pathname) === normalizePath(item.route);
}

function withReportMenu(item: TreeMenuItem, translate: (key: string) => string) {
  if (item.name !== "reports") {
    return item;
  }

  const base = String(item.route ?? "").replace(/\/$/, "");
  if (!base) {
    return item;
  }

  const children = REPORT_KIND_VALUES.map((kind) => {
    const Icon = REPORT_MENU_ICONS[kind];
    const icon = React.createElement(Icon, { className: "h-4 w-4" });
    const label = translate(`reports.kinds.${kind}.title`);
    return {
      name: `reports/${kind}`,
      key: `/reports/${kind}`,
      route: `${base}/${kind}`,
      label,
      icon,
      meta: { label, icon },
      children: [],
    } as TreeMenuItem;
  });

  return { ...item, children };
}

function organizeMenuItems(
  items: TreeMenuItem[],
  roles: readonly string[],
  translate: (key: string) => string
): TreeMenuItem[] {
  const usable = items.filter((item) => !HIDDEN_NAV.has(item.name ?? ""));
  const nav: TreeMenuItem[] = [];

  if (isAdminRole(roles)) {
    const dashboard = takeItem(usable, "dashboard");
    if (dashboard) {
      nav.push({
        ...dashboard,
        meta: { ...dashboard.meta, label: translate("dashboard.adminHome") },
      } as TreeMenuItem);
    }
    const directory = pickItems(usable, [
      "people",
      "waiting-list",
      "mailing-lists",
      "events",
      "sponsors",
      "payments",
    ]);
    if (directory.length) {
      nav.push(navGroup("directory", translate("dashboard.adminNavDirectory"), directory));
    }
    const reporting = pickItems(usable, ["reports"]).map((item) =>
      withReportMenu(item, translate)
    );
    if (reporting.length) {
      nav.push(navGroup("reporting", translate("dashboard.adminNavReporting"), reporting));
    }
    const oversight = pickItems(usable, ["audit-logs", "app-settings"]);
    if (oversight.length) {
      nav.push(navGroup("oversight", translate("dashboard.adminNavOversight"), oversight));
    }
    return nav;
  }

  return usable;
}

export function Sidebar() {
  const { open } = useShadcnSidebar();
  const { menuItems, selectedKey } = useMenu();
  const pathname = usePathname() ?? "";
  const translate = useTranslate();
  const { roles } = useSessionRoles();
  const visibleItems = organizeMenuItems(
    filterMenuItems(menuItems, roles),
    roles,
    translate
  );

  return (
    <ShadcnSidebar
      collapsible="icon"
      className={cn("z-20 border-r-0", LAYOUT_CHROME_BG)}
    >
      <ShadcnSidebarRail />
      <SidebarHeader />
      <ShadcnSidebarContent
        className={cn(
          "flex flex-col py-3",
          LAYOUT_SIDEBAR_BODY_SHADOW,
          open ? "gap-1 px-4" : "items-center gap-1.5 px-0"
        )}
        aria-label={translate("dashboard.navigation")}
      >
        {visibleItems.map((item: TreeMenuItem) => (
          <SidebarItem
            key={item.key || item.name}
            item={item}
            selectedKey={selectedKey}
            pathname={pathname}
          />
        ))}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

type MenuItemProps = {
  item: TreeMenuItem;
  selectedKey?: string;
  pathname: string;
};

function SidebarItem({ item, selectedKey, pathname }: MenuItemProps) {
  const { open } = useShadcnSidebar();

  if (item.meta?.group) {
    return (
      <SidebarItemGroup
        item={item}
        selectedKey={selectedKey}
        pathname={pathname}
      />
    );
  }

  if (item.children && item.children.length > 0) {
    if (open) {
      return (
        <SidebarItemCollapsible
          item={item}
          selectedKey={selectedKey}
          pathname={pathname}
        />
      );
    }
    return (
      <SidebarItemDropdown
        item={item}
        selectedKey={selectedKey}
        pathname={pathname}
      />
    );
  }

  return (
    <SidebarItemLink
      item={item}
      selectedKey={selectedKey}
      pathname={pathname}
    />
  );
}

function SidebarItemGroup({ item, selectedKey, pathname }: MenuItemProps) {
  const { children } = item;
  const { open } = useShadcnSidebar();
  const translate = useTranslate();

  return (
    <div
      className={cn(
        open && "border-t border-sidebar-border pt-4",
        !open && "flex flex-col items-center"
      )}
    >
      <span
        className={cn(
          "ml-3",
          "block",
          "text-xs",
          "font-semibold",
          "uppercase",
          "text-muted-foreground",
          "transition-all",
          "duration-200",
          {
            "h-8": open,
            hidden: !open,
            "opacity-100": open,
            "pointer-events-auto": open,
          }
        )}
      >
        {getDisplayName(item, translate)}
      </span>
      {children && children.length > 0 && (
        <div className={cn("flex flex-col", !open && "items-center gap-1.5")}>
          {children.map((child: TreeMenuItem) => (
            <SidebarItem
              key={child.key || child.name}
              item={child}
              selectedKey={selectedKey}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItemCollapsible({ item, selectedKey, pathname }: MenuItemProps) {
  const { name, children } = item;
  const childActive = children?.some((child) =>
    isMenuItemSelected(child, selectedKey, pathname)
  );
  const isSelected =
    !childActive && isMenuItemSelected(item, selectedKey, pathname);
  const [expanded, setExpanded] = useState(Boolean(childActive || isSelected));

  useEffect(() => {
    if (childActive || isSelected) {
      setExpanded(true);
    }
  }, [childActive, isSelected]);

  const chevronIcon = (
    <ChevronRight
      className={cn(
        "h-4",
        "w-4",
        "shrink-0",
        "transition-transform",
        "duration-200",
        "group-data-[state=open]:rotate-90",
        isSelected ? "text-current" : "text-muted-foreground"
      )}
    />
  );

  return (
    <Collapsible
      key={`collapsible-${name}`}
      className={cn("w-full", "group")}
      open={expanded}
      onOpenChange={setExpanded}
    >
      <CollapsibleTrigger asChild>
        <SidebarButton
          item={item}
          isSelected={isSelected}
          rightIcon={chevronIcon}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ml-6", "flex", "flex-col", "gap-2")}>
        {children?.map((child: TreeMenuItem) => (
          <SidebarItem
            key={child.key || child.name}
            item={child}
            selectedKey={selectedKey}
            pathname={pathname}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItemDropdown({ item, selectedKey, pathname }: MenuItemProps) {
  const { children } = item;
  const { open } = useShadcnSidebar();
  const Link = useLink();
  const translate = useTranslate();
  const label = getDisplayName(item, translate);
  const isSelected = children?.some((child) =>
    isMenuItemSelected(child, selectedKey, pathname)
  );

  const trigger = (
    <DropdownMenuTrigger asChild>
      <SidebarButton item={item} isSelected={isSelected} />
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {open ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{trigger}</span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      )}
      <DropdownMenuContent side="right" align="start">
        {children?.map((child: TreeMenuItem) => {
          const { key: childKey } = child;
          const isSelected = isMenuItemSelected(child, selectedKey, pathname);

          return (
            <DropdownMenuItem key={childKey || child.name} asChild>
              <Link
                to={child.route || ""}
                className={cn("flex w-full items-center gap-2", {
                  "bg-accent text-accent-foreground": isSelected,
                })}
              >
                <ItemIcon
                  icon={child.meta?.icon ?? child.icon}
                  isSelected={isSelected}
                />
                <span>{getDisplayName(child, translate)}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItemLink({ item, selectedKey, pathname }: MenuItemProps) {
  const { open } = useShadcnSidebar();
  const translate = useTranslate();
  const isSelected = isMenuItemSelected(item, selectedKey, pathname);
  const button = (
    <SidebarButton item={item} isSelected={isSelected} asLink={true} />
  );

  if (open) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {getDisplayName(item, translate)}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarHeader() {
  const { open } = useShadcnSidebar();
  const { path } = useLocale();
  const translate = useTranslate();
  const Link = useLink();
  const { isAdmin } = useRoleFlags();
  const deskLabel = translate(
    isAdmin ? "dashboard.adminEyebrow" : "dashboard.guestEyebrow"
  );

  return (
    <ShadcnSidebarHeader
      className={cn(
        "relative z-20 h-16 flex-row items-center p-0",
        LAYOUT_CHROME_BG,
        LAYOUT_HEADER_SHADOW
      )}
    >
      <div
        className={cn(
          "flex h-full w-full flex-row items-center whitespace-nowrap",
          open ? "justify-start px-5" : "justify-center px-0"
        )}
      >
        <Link
          to={path("/dashboard")}
          className="flex min-w-0 flex-col items-start justify-center gap-0.5"
          aria-label={translate("brand.name")}
        >
          <AppLogo
            showWordmark={open}
            className={cn("text-primary", open ? "h-9" : "size-8")}
          />
          {open ? (
            <span className="pl-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {deskLabel}
            </span>
          ) : null}
        </Link>
      </div>
    </ShadcnSidebarHeader>
  );
}

function getDisplayName(
  item: TreeMenuItem,
  translate: (key: string, options?: string) => string
) {
  const raw = item.meta?.label ?? item.label ?? item.name;
  return translate(String(raw), String(raw));
}

type IconProps = {
  icon: React.ReactNode;
  isSelected?: boolean;
};

function ItemIcon({ icon, isSelected }: IconProps) {
  return (
    <div
      className={cn(
        "flex w-4 items-center justify-center",
        isSelected ? "text-inherit" : "text-primary"
      )}
    >
      {icon ?? <ListIcon />}
    </div>
  );
}

type SidebarButtonProps = React.ComponentProps<typeof Button> & {
  item: TreeMenuItem;
  isSelected?: boolean;
  rightIcon?: React.ReactNode;
  asLink?: boolean;
  onClick?: () => void;
};

function SidebarButton({
  item,
  isSelected = false,
  rightIcon,
  asLink = false,
  className,
  onClick,
  ...props
}: SidebarButtonProps) {
  const Link = useLink();
  const translate = useTranslate();
  const { open } = useShadcnSidebar();
  const label = getDisplayName(item, translate);

  const buttonContent = (
    <>
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span
        className={cn("tracking-tight", {
          "sr-only": !open,
          "flex-1 text-left": open && rightIcon,
          "line-clamp-1 truncate": open && !rightIcon,
        })}
      >
        {label}
      </span>
      {open ? rightIcon : null}
    </>
  );

  return (
    <Button
      asChild={!!(asLink && item.route)}
      variant="ghost"
      size={open ? "lg" : "icon"}
      aria-label={label}
      className={cn(
        "rounded-lg text-sm font-medium",
        open
          ? "h-11 w-full justify-start gap-3 px-3"
          : "size-9 shrink-0 justify-center p-0",
        isSelected
          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {asLink && item.route ? (
        <Link
          to={item.route}
          className={cn(
            "flex items-center",
            open ? "w-full gap-2" : "size-full justify-center"
          )}
        >
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </Button>
  );
}

Sidebar.displayName = "Sidebar";
