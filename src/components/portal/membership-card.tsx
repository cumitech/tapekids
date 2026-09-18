"use client";

import { useTranslate } from "@refinedev/core";
import { CalendarDays, MapPin } from "lucide-react";

import { PaymentCheckout } from "@/components/payments/payment-checkout";
import Link from "next/link";
import {
  MEMBERSHIP_KIND_ACCENT,
  MEMBERSHIP_KIND_SOFT,
} from "@/components/portal/portal-tone";
import { EventScheduleBadge } from "@/components/events/event-schedule-badge";
import { EventImage } from "@/components/events/event-image";
import { StatusBadge } from "@/components/portal/status-badge";
import { Button } from "@/components/shared/ui/button";
import { PAYMENT_STATUSES } from "@/constants/event-participation";
import { PORTAL_SURFACE, PORTAL_SURFACE_HOVER } from "@/constants/layout";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MeMembership } from "@/models/me/me.model";

type MembershipCardProps = {
  membership: MeMembership;
  personId: string;
  defaultPhone?: string | null;
  redirectPath: string;
  onPaid?: () => void;
  profileComplete?: boolean;
};

export function MembershipCard({
  membership,
  personId,
  defaultPhone,
  redirectPath,
  onPaid,
  profileComplete = true,
}: MembershipCardProps) {
  const translate = useTranslate();
  const { path, locale } = useLocale();
  const { openCreate } = useDashboardFormModal();
  const event = membership.event;
  const paid =
    membership.payment?.status === PAYMENT_STATUSES.PAID ||
    membership.payment?.status === PAYMENT_STATUSES.WAIVED;
  const due = !paid && membership.dueAmount > 0;
  const accent = MEMBERSHIP_KIND_ACCENT[membership.kind] ?? "bg-primary";
  const soft = MEMBERSHIP_KIND_SOFT[membership.kind] ?? "bg-accent text-foreground";

  const openPayModal = () => {
    if (!event) {
      return;
    }
    openCreate(
      "payments",
      ({ close }) => (
        <PaymentCheckout
          personId={personId}
          defaultPhone={defaultPhone}
          eventId={event.id}
          kind={membership.kind}
          lockSelection
          hideTitle
          endpoint="/me/payments"
          redirectPath={redirectPath}
          onCancel={close}
          onSuccess={() => {
            close();
            onPaid?.();
          }}
        />
      ),
      "sm:max-w-md"
    );
  };

  return (
    <article
      className={cn(
        PORTAL_SURFACE,
        PORTAL_SURFACE_HOVER,
        "relative overflow-hidden p-0"
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", accent)} />
      {event?.imageUrl ? (
        <EventImage
          src={event.imageUrl}
          alt={event.title}
          className="aspect-[16/10] w-full rounded-none"
        />
      ) : null}
      <div className="flex flex-col gap-5 p-5 pl-6 md:p-6 md:pl-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={cn(
                "mb-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                soft
              )}
            >
              {translate(`payments.kinds.${membership.kind}`, membership.kind)}
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {event?.title ?? translate("portal.unknownEvent")}
            </h2>
            {event ? (
              <div className="mt-2">
                <EventScheduleBadge
                  startsAt={event.startsAt}
                  endsAt={event.endsAt}
                />
              </div>
            ) : null}
            {event?.summary ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {event.summary}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge namespace="membership" value={membership.status} />
            {membership.payment ? (
              <StatusBadge namespace="payment" value={membership.payment.status} />
            ) : null}
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl bg-accent/70 px-3 py-3 text-sm">
            <span className="flex size-9 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
              <CalendarDays className="size-4" />
            </span>
            <div>
              <dt className="font-medium text-foreground">
                {translate("events.fields.startsAt")}
              </dt>
              <dd className="text-muted-foreground">
                {formatDateTime(event?.startsAt, locale)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-secondary/12 px-3 py-3 text-sm">
            <span className="flex size-9 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
              <MapPin className="size-4" />
            </span>
            <div>
              <dt className="font-medium text-foreground">
                {translate("events.fields.venue")}
              </dt>
              <dd className="text-muted-foreground">
                {[event?.venue, event?.city].filter(Boolean).join(" · ") || "-"}
              </dd>
            </div>
          </div>
        </dl>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/80 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {translate("payments.title")}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {due
                ? formatMoney(membership.dueAmount, membership.currency)
                : paid
                  ? translate("portal.settled")
                  : translate("portal.noFee")}
            </p>
          </div>
          {due ? (
            profileComplete ? (
              <Button type="button" size="lg" onClick={openPayModal}>
                {translate("portal.pay")}
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href={path("/dashboard/profile")}>
                  {translate("onboarding.completeToPay")}
                </Link>
              </Button>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
