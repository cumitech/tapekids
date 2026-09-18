"use client";

import { useTranslate } from "@refinedev/core";

import { PersonForm } from "@/components/people/person-form.component";
import { PortalEmpty, PortalLoading } from "@/components/portal/portal-empty";
import { PortalHero } from "@/components/portal/portal-hero";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useMe } from "@/hooks/core/use-me.hook";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const translate = useTranslate();
  const { profile, loading, reload } = useMe();

  return (
    <section className="flex flex-col gap-8">
      <PortalHero
        tone="profile"
        eyebrow={translate("profile.eyebrow")}
        title={translate("profile.titles.list")}
        description={translate("profile.description")}
        showBack
      />
      {loading ? (
        <PortalLoading />
      ) : !profile ? (
        <PortalEmpty
          title={translate("profile.unavailableTitle")}
          description={translate("profile.unavailableDescription")}
        />
      ) : (
        <div className={cn(PORTAL_SURFACE, "p-5 md:p-6")}>
          <PersonForm
            mode="edit"
            id="me"
            resource="me"
            record={profile.person}
            showCancel={false}
            onSuccess={() => void reload()}
          />
        </div>
      )}
    </section>
  );
}
