"use client";

import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useTranslate,
} from "@refinedev/core";
import { LogOutIcon, UserRound } from "lucide-react";
import Link from "next/link";

import { UserAvatar } from "@/components/shared/refine-ui/layout/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { leaveSession } from "@/utils/auth-storage";
import { cn } from "@/lib/utils";

type Identity = {
  id?: string | number;
  name?: string;
  email?: string;
};

export function UserMenu() {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const translate = useTranslate();
  const { path } = useLocale();
  const { data: user } = useGetIdentity<Identity>();
  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) {
    return null;
  }

  const displayName = user?.name || user?.email || translate("header.account");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-md bg-white px-1.5 py-1 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-background",
          "outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label={translate("header.account")}
      >
        <UserAvatar className="h-8 w-8" />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium md:inline">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{displayName}</span>
            {user?.email && user.email !== displayName ? (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={path("/dashboard/profile")} className="cursor-pointer">
            <UserRound />
            <span>{translate("profile.titles.list")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            logout();
            leaveSession(path("/login"));
          }}
        >
          <LogOutIcon />
          <span>
            {isLoggingOut
              ? translate("header.loggingOut")
              : translate("header.logout")}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
