"use client";

import { useState } from "react";
import { useTranslate } from "@refinedev/core";

import { InvitationEmailPreview } from "@/components/invitations/invitation-email-preview";
import { EventSelect } from "@/components/events/event-select";
import { LabeledField } from "@/components/shared/form/labeled-field";
import { LocalizedTabs } from "@/components/shared/form/localized-tabs";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { INVITATION_AUDIENCE_VALUES } from "@/constants/event-participation";
import type { InvitationAudience } from "@/constants/event-participation";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { RichTextEditor } from "@/components/shared/form/rich-text-editor";
import { useInvitationQueue } from "@/hooks/invitations/use-invitation-queue.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import type { InvitationDeliveryResult } from "@/lib/invitations/delivery-notice";
import { DEFAULT_LOCALE } from "@/constants/locales";
import { pickFromLocaleMap } from "@/lib/content-i18n/pick";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/ui/alert-dialog";

type InvitationQueueFormProps = {
  mailingListId: string;
  eventId?: string;
  lockEvent?: boolean;
  prepareOnly?: boolean;
  onSent?: (result: InvitationDeliveryResult) => void;
};

export function InvitationQueueForm({
  mailingListId,
  eventId,
  lockEvent = false,
  prepareOnly = false,
  onSent,
}: InvitationQueueFormProps) {
  const translate = useTranslate();
  const integrations = useIntegrations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queue = useInvitationQueue(mailingListId, {
    eventId,
    prepareOnly,
    onSent,
  });
  const readiness = queue.readiness;

  return (
    <section
      id="prepare-invitations"
      className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card"
    >
      <h3 className="text-lg font-semibold">{queue.actionLabel}</h3>
      {prepareOnly ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {translate("mailingLists.prepareOnlyHint")}
        </p>
      ) : null}
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          {lockEvent ? (
            <p className="text-sm font-medium">
              {queue.event?.title || translate("prepareEvent.eventPending")}
            </p>
          ) : (
            <EventSelect
              value={queue.eventId}
              onChange={queue.setEventId}
              required
            />
          )}
          <LabeledSelect
            label={translate("mailingLists.fields.kind")}
            value={queue.audience}
            onChange={(next) => queue.setAudience(next as InvitationAudience)}
            options={INVITATION_AUDIENCE_VALUES.map((audience) => ({
              value: audience,
              label: translate(`mailingLists.audiences.${audience}`),
            }))}
            required
          />
          <LocalizedTabs
            value={queue.previewLocale}
            onValueChange={queue.setPreviewLocale}
          >
            {(tabLocale) => (
              <>
                <LabeledField
                  label={translate("mailingLists.fields.subject")}
                  required={tabLocale === DEFAULT_LOCALE}
                >
                  <Input
                    value={queue.subject[tabLocale]}
                    onChange={(change) =>
                      queue.setSubject((current) => ({
                        ...current,
                        [tabLocale]: change.target.value,
                      }))
                    }
                  />
                </LabeledField>
                <LabeledField
                  label={translate("mailingLists.fields.body")}
                  required={tabLocale === DEFAULT_LOCALE}
                >
                  <RichTextEditor
                    disabled={!queue.eventId}
                    value={queue.body[tabLocale]}
                    onChange={(html) =>
                      queue.setBody((current) => ({
                        ...current,
                        [tabLocale]: html,
                      }))
                    }
                  />
                </LabeledField>
              </>
            )}
          </LocalizedTabs>
          {readiness ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <h4 className="font-medium">
                {translate("mailingLists.readinessTitle")}
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <ReadinessCount
                  label={translate("mailingLists.readinessTotal")}
                  count={readiness.total}
                />
                <ReadinessCount
                  label={translate("mailingLists.readinessReady")}
                  count={readiness.readyCount}
                  emphasis="text-emerald-700 dark:text-emerald-400"
                />
                <ReadinessCount
                  label={translate("mailingLists.readinessInvalid")}
                  count={readiness.invalidEmailCount}
                  emphasis="text-destructive"
                />
                <ReadinessCount
                  label={translate("mailingLists.readinessExisting")}
                  count={readiness.existingInvitationCount}
                />
              </div>
              {readiness.invalidRecipients.length ||
              readiness.existingRecipients.length ? (
                <ul className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                  {readiness.invalidRecipients.slice(0, 5).map((person) => (
                    <li key={`invalid-${person.id}`}>
                      {translate("mailingLists.readinessInvalidPerson", {
                        name: person.fullName,
                        email:
                          person.email ||
                          translate("mailingLists.readinessNoEmail"),
                      })}
                    </li>
                  ))}
                  {readiness.invalidRecipients.length > 5 ? (
                    <li>
                      {translate("mailingLists.readinessMore", {
                        count: readiness.invalidRecipients.length - 5,
                      })}
                    </li>
                  ) : null}
                  {readiness.existingRecipients.slice(0, 5).map((person) => (
                    <li key={`existing-${person.id}`}>
                      {translate("mailingLists.readinessExistingPerson", {
                        name: person.fullName,
                        email:
                          person.email ||
                          translate("mailingLists.readinessNoEmail"),
                      })}
                    </li>
                  ))}
                  {readiness.existingRecipients.length > 5 ? (
                    <li>
                      {translate("mailingLists.readinessMore", {
                        count: readiness.existingRecipients.length - 5,
                      })}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            {readiness ? (
              <Button
                type="button"
                variant="outline"
                disabled={queue.busy}
                onClick={() => void queue.reviewRecipients()}
              >
                {translate("mailingLists.refreshReadiness")}
              </Button>
            ) : null}
            {!readiness ? (
              <Button
                type="button"
                disabled={!queue.canSend}
                onClick={() => void queue.reviewRecipients()}
              >
                {translate("mailingLists.reviewRecipients")}
              </Button>
            ) : (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <Button
                  type="button"
                  disabled={!queue.canSend || readiness.readyCount === 0}
                  onClick={() => setConfirmOpen(true)}
                >
                  {prepareOnly
                    ? translate("mailingLists.confirmPrepareButton", {
                        count: readiness.readyCount,
                      })
                    : !integrations.mailEnabled
                      ? translate("mailingLists.confirmQueueButton", {
                          count: readiness.readyCount,
                        })
                    : translate("mailingLists.confirmSendButton", {
                        count: readiness.readyCount,
                      })}
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {translate(
                        prepareOnly
                          ? "mailingLists.confirmPrepareTitle"
                          : !integrations.mailEnabled
                            ? "mailingLists.confirmQueueTitle"
                          : "mailingLists.confirmSendTitle"
                      )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {translate(
                        prepareOnly
                          ? "mailingLists.confirmPrepareDescription"
                          : !integrations.mailEnabled
                            ? "mailingLists.confirmQueueDescription"
                          : "mailingLists.confirmSendDescription",
                        {
                          count: readiness.readyCount,
                          invalid: readiness.invalidEmailCount,
                          existing: readiness.existingInvitationCount,
                        }
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {translate("buttons.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={queue.busy || readiness.readyCount === 0}
                      onClick={(event) => {
                        event.preventDefault();
                        void queue.send().then((success) => {
                          if (success) {
                            setConfirmOpen(false);
                          }
                        });
                      }}
                    >
                      {prepareOnly
                        ? translate("mailingLists.confirmPrepare")
                        : !integrations.mailEnabled
                          ? translate("mailingLists.confirmQueue")
                        : translate("mailingLists.confirmSend")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <InvitationEmailPreview
          event={queue.event}
          locale={queue.previewLocale}
          subject={pickFromLocaleMap(queue.subject, queue.previewLocale)}
          body={pickFromLocaleMap(queue.body, queue.previewLocale, {
            html: true,
          })}
        />
      </div>
    </section>
  );
}

function ReadinessCount({
  label,
  count,
  emphasis = "",
}: {
  label: string;
  count: number;
  emphasis?: string;
}) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <div className={`text-lg font-semibold tabular-nums ${emphasis}`}>
        {count}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
