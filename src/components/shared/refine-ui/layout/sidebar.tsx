"use client";

import React from "react";
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
import { hasRole, isAdminRole, USER_ROLES } from "@/constants/user-roles";
import { ChevronRight, ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const directory = pickItems(usable, ["people", "mailing-lists", "events"]);
    if (directory.length) {
      nav.push(navGroup("directory", translate("dashboard.adminNavDirectory"), directory));
    }
    const oversight = pickItems(usable, ["audit-logs"]);
    if (oversight.length) {
      nav.push(navGroup("oversight", translate("dashboard.adminNavOversight"), oversight));
    }
    return nav;
  }

  if (hasRole(roles, USER_ROLES.STAFF)) {
    const dashboard = takeItem(usable, "dashboard");
    if (dashboard) {
      nav.push({
        ...dashboard,
        meta: { ...dashboard.meta, label: translate("dashboard.staffHome") },
      } as TreeMenuItem);
    }
    const daily = pickItems(usable, ["people", "mailing-lists", "events"]);
    if (daily.length) {
      nav.push(navGroup("daily-work", translate("dashboard.staffNavGroup"), daily));
    }
    return nav;
  }

  return usable;
}

export function Sidebar() {
  const { open } = useShadcnSidebar();
  const { menuItems, selectedKey } = useMenu();
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
          />
        ))}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

type MenuItemProps = {
  item: TreeMenuItem;
  selectedKey?: string;
};

function SidebarItem({ item, selectedKey }: MenuItemProps) {
  const { open } = useShadcnSidebar();

  if (item.meta?.group) {
    return <SidebarItemGroup item={item} selectedKey={selectedKey} />;
  }

  if (item.children && item.children.length > 0) {
    if (open) {
      return <SidebarItemCollapsible item={item} selectedKey={selectedKey} />;
    }
    return <SidebarItemDropdown item={item} selectedKey={selectedKey} />;
  }

  return <SidebarItemLink item={item} selectedKey={selectedKey} />;
}

function SidebarItemGroup({ item, selectedKey }: MenuItemProps) {
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItemCollapsible({ item, selectedKey }: MenuItemProps) {
  const { name, children } = item;

  const chevronIcon = (
    <ChevronRight
      className={cn(
        "h-4",
        "w-4",
        "shrink-0",
        "text-muted-foreground",
        "transition-transform",
        "duration-200",
        "group-data-[state=open]:rotate-90"
      )}
    />
  );

  return (
    <Collapsible key={`collapsible-${name}`} className={cn("w-full", "group")}>
      <CollapsibleTrigger asChild>
        <SidebarButton item={item} rightIcon={chevronIcon} />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ml-6", "flex", "flex-col", "gap-2")}>
        {children?.map((child: TreeMenuItem) => (
          <SidebarItem
            key={child.key || child.name}
            item={child}
            selectedKey={selectedKey}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItemDropdown({ item, selectedKey }: MenuItemProps) {
  const { children } = item;
  const { open } = useShadcnSidebar();
  const Link = useLink();
  const translate = useTranslate();
  const label = getDisplayName(item, translate);

  const trigger = (
    <DropdownMenuTrigger asChild>
      <SidebarButton item={item} />
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
          const isSelected = childKey === selectedKey;

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

function SidebarItemLink({ item, selectedKey }: MenuItemProps) {
  const { open } = useShadcnSidebar();
  const translate = useTranslate();
  const isSelected = item.key === selectedKey;
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
    isAdmin ? "dashboard.adminEyebrow" : "dashboard.staffEyebrow"
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
