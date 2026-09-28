"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { PersonForm } from "@/components/people/person-form.component";
import { PortalEmpty, PortalLoading } from "@/components/portal/portal-empty";
import { PortalHero } from "@/components/portal/portal-hero";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useMe } from "@/hooks/core/use-me.hook";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const translate = useTranslate();
  const router = useRouter();
  const { path } = useLocale();
  const { profile, loading, profileComplete, reload } = useMe();
  const [saved, setSaved] = useState(false);
  const person = profile?.person;

  useEffect(() => {
    if (saved && !loading && profileComplete) {
      router.replace(path("/dashboard"));
    }
  }, [saved, loading, profileComplete, path, router]);

  return (
    <section className="flex flex-col gap-8">
      <PortalHero
        tone="profile"
        eyebrow={translate("profile.eyebrow")}
        title={translate("profile.titles.list")}
        description={translate("profile.description")}
        showBack
        backHref="/dashboard"
        stats={
          person
            ? [
                {
                  label: translate("people.fields.yfId"),
                  value: person.yfId?.trim() || "—",
                  accent: "ivory",
                },
                {
                  label: translate("people.fields.points"),
                  value: person.points ?? 0,
                  accent: "gold",
                },
              ]
            : undefined
        }
      />
      {loading ? (
        <PortalLoading />
      ) : !profile ? (
        <PortalEmpty
          title={translate("profile.unavailableTitle")}
          description={translate("profile.unavailableDescription")}
        />
      ) : (
        <div className={cn(PORTAL_SURFACE, "flex flex-col gap-6 p-5 md:p-6")}>
          <PersonForm
            mode="edit"
            id="me"
            resource="me"
            record={profile.person}
            showCancel={false}
            onSuccess={() => {
              void reload().finally(() => setSaved(true));
            }}
          />
        </div>
      )}
    </section>
  );
}
