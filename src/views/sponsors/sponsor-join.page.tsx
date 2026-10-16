"use client";

import { PhoneField } from "@/components/shared/form/phone-field";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { RequiredMark } from "@/components/shared/form/required-mark";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@/components/shared/ui/separator";
import { useSponsorJoinPage } from "@/hooks/sponsors/use-sponsor-join.hook";
import { PublicShell } from "@/views/auth/public-shell";

export function SponsorJoinPage() {
  const page = useSponsorJoinPage();
  const { translate, charge } = page;

  return (
    <PublicShell>
      <AuthFormFrame>
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
            {translate("sponsors.joinTitle")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {translate("sponsors.joinDescription")}
          </CardDescription>
        </CardHeader>
        <Separator />
        {page.paid ? (
          <div className="flex flex-col gap-2 font-serif text-base leading-relaxed">
            <p>{translate("sponsors.paid")}</p>
            {charge?.payment?.trackingId ? (
              <p>
                {translate("payments.fields.trackingId")}:{" "}
                <span className="font-mono">{charge.payment.trackingId}</span>
              </p>
            ) : null}
          </div>
        ) : charge ? (
          <div className="flex flex-col gap-3 text-sm">
            <p>{translate("sponsors.waiting")}</p>
            {charge.ussdCode ? (
              <p>
                {translate("payments.ussd")}: <strong>{charge.ussdCode}</strong>
              </p>
            ) : null}
            {charge.link ? (
              <a
                className="underline"
                href={charge.link}
                target="_blank"
                rel="noreferrer"
              >
                {translate("payments.openLink")}
              </a>
            ) : null}
            {charge.payment?.trackingId ? (
              <p className="font-mono">{charge.payment.trackingId}</p>
            ) : null}
          </div>
        ) : page.step === 1 ? (
          <form className="flex flex-col gap-4" onSubmit={page.continueToPayment}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-name">
                {translate("people.fields.fullName")}
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-name"
                value={page.fullName}
                onChange={(event) => page.setFullName(event.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-email">
                {translate("people.fields.email")}
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-email"
                type="email"
                value={page.email}
                onChange={(event) => page.setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <PhoneField
              id="sponsor-phone"
              label={translate("people.fields.phone")}
              value={page.phone}
              onChange={page.setPhone}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={page.anonymous}
                onCheckedChange={(checked) =>
                  page.setAnonymous(checked === true)
                }
              />
              {translate("sponsors.anonymous")}
            </label>
            <LabeledSelect
              label={translate("sponsors.event")}
              value={page.eventId}
              onChange={page.setEventId}
              required
              placeholder={translate("sponsors.eventPlaceholder")}
              options={page.events.map((event) => ({
                value: event.id,
                label: event.title,
              }))}
            />
            {page.error ? (
              <p className="text-sm text-destructive" role="alert">
                {page.error}
              </p>
            ) : null}
            <Button type="submit">{translate("people.steps.next")}</Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={page.pay}>
            <p className="text-sm text-muted-foreground">
              {translate("sponsors.paymentHint")}
            </p>
            <PhoneField
              id="sponsor-payment-phone"
              label={translate("sponsors.paymentPhone")}
              value={page.paymentPhone}
              onChange={page.setPaymentPhone}
              required
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-amount">
                {translate("payments.fields.amount")} (XAF)
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-amount"
                type="number"
                min={page.sponsorAmount}
                step={1}
                inputMode="numeric"
                value={page.amount}
                onChange={(event) => page.setAmount(event.target.value)}
                placeholder={translate("payments.amountPlaceholder")}
                required
              />
              <p className="text-xs text-muted-foreground">
                {translate("sponsors.amountMinimum", {
                  amount: page.sponsorAmount,
                })}
              </p>
            </div>
            {page.error ? (
              <p className="text-sm text-destructive" role="alert">
                {page.error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={page.backToDetails}
              >
                {translate("people.steps.back")}
              </Button>
              <Button type="submit" disabled={page.busy}>
                {page.busy
                  ? translate("sponsors.paying")
                  : translate("sponsors.pay")}
              </Button>
            </div>
          </form>
        )}
      </AuthFormFrame>
    </PublicShell>
  );
}
