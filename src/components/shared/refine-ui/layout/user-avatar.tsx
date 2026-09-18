"use client";

import { useGetIdentity } from "@refinedev/core";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { cn } from "@/lib/utils";

type User = {
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
};

type UserAvatarProps = {
  className?: string;
};

export function UserAvatar({ className }: UserAvatarProps) {
  const { data: user, isLoading: userIsLoading } = useGetIdentity<User>();

  if (userIsLoading || !user) {
    return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
  }

  const displayName = user.fullName || user.name || user.email || "";

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  );
}

function getInitials(name = "") {
  const names = name.trim().split(/\s+/).filter(Boolean);
  if (names.length === 0) {
    return "?";
  }

  const first = names[0].charAt(0).toUpperCase();
  const last =
    names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : "";
  return `${first}${last}`;
}

UserAvatar.displayName = "UserAvatar";
