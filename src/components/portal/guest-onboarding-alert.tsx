"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useMe } from "@/hooks/core/use-me.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";

const SNOOZE_MS = 24 * 60 * 60 * 1000;

function preventDismiss(event: Event) {
  event.preventDefault();
}

function readSnoozed() {
  if (typeof window === "undefined") {
    return true;
  }
  const until = Number(window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_SNOOZE) || 0);
  return until > Date.now();
}

export function GuestOnboardingAlert() {
  const translate = useTranslate();
  const { path } = useLocale();
  const pathname = usePathname();
  const { loading, profileComplete } = useMe();
  const onProfile = Boolean(pathname?.includes("/dashboard/profile"));
  const [snoozed, setSnoozed] = useState(true);

  useEffect(() => {
    setSnoozed(readSnoozed());
  }, [profileComplete]);

  const open = !loading && !profileComplete && !onProfile && !snoozed;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-primary/25 backdrop-blur-md"
        className="border-primary bg-primary text-primary-foreground sm:max-w-md"
        onPointerDownOutside={preventDismiss}
        onInteractOutside={preventDismiss}
        onEscapeKeyDown={preventDismiss}
      >
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-white/15">
            <ClipboardList className="size-5" />
          </div>
          <DialogTitle className="text-xl text-primary-foreground">
            {translate("onboarding.title")}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/90">
            {translate("onboarding.profile")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            asChild
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href={path("/dashboard/profile")}>
              {translate("onboarding.updateProfile")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            onClick={() => {
              window.localStorage.setItem(
                STORAGE_KEYS.ONBOARDING_SNOOZE,
                String(Date.now() + SNOOZE_MS)
              );
              setSnoozed(true);
            }}
          >
            {translate("onboarding.later")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
