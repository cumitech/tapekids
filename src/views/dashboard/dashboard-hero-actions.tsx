"use client";

import { UserPlus, UserRound } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import Link from "next/link";

import { Button } from "@/components/shared/ui/button";
import { useLocale } from "@/hooks/core/use-locale.hook";

const HERO_BUTTON =
  "h-12 w-full justify-center bg-white text-primary hover:bg-[#e1edef] md:h-9 md:w-auto";

export function DashboardAddPersonAction() {
  const translate = useTranslate();
  const { path } = useLocale();

  return (
    <Button asChild className={HERO_BUTTON}>
      <Link href={path("/dashboard/people")}>
        <UserPlus className="size-4" />
        {translate("dashboard.staffAddPerson")}
      </Link>
    </Button>
  );
}

export function DashboardOpenProfileAction() {
  const translate = useTranslate();
  const { path } = useLocale();

  return (
    <Button asChild className={HERO_BUTTON}>
      <Link href={path("/dashboard/profile")}>
        <UserRound className="size-4" />
        {translate("dashboard.guestOpenProfile")}
      </Link>
    </Button>
  );
}
