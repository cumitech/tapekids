"use client";

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
import type { InvitationDeliveryResult } from "@/lib/invitations/delivery-notice";
import { DEFAULT_LOCALE } from "@/constants/locales";
import { pickFromLocaleMap } from "@/lib/content-i18n/pick";

type InvitationQueueFormProps = {
  mailingListId: string;
  eventId?: string;
  lockEvent?: boolean;
  onSent?: (result: InvitationDeliveryResult) => void;
};

export function InvitationQueueForm({
  mailingListId,
  eventId,
  lockEvent = false,
  onSent,
}: InvitationQueueFormProps) {
  const translate = useTranslate();
  const queue = useInvitationQueue(mailingListId, { eventId, onSent });

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
      <h3 className="text-lg font-semibold">{queue.actionLabel}</h3>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          {lockEvent ? (
            <p className="text-sm font-medium">
              {queue.event?.title || translate("prepareEvent.eventPending")}
            </p>
          ) : (
            <EventSelect value={queue.eventId} onChange={queue.setEventId} required />
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
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!queue.canSend}
              onClick={() => void queue.send()}
            >
              {queue.actionLabel}
            </Button>
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
