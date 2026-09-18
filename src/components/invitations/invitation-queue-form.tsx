"use client";

import { useTranslate } from "@refinedev/core";

import { InvitationEmailPreview } from "@/components/invitations/invitation-email-preview";
import { EventSelect } from "@/components/events/event-select";
import { LabeledField } from "@/components/shared/form/labeled-field";
import { LocalizedTabs } from "@/components/shared/form/localized-tabs";
import { MembershipKindSelect } from "@/components/shared/form/membership-kind-select";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { RichTextEditor } from "@/components/shared/form/rich-text-editor";
import { useInvitationQueue } from "@/hooks/invitations/use-invitation-queue.hook";

type InvitationQueueFormProps = {
  mailingListId: string;
};

export function InvitationQueueForm({ mailingListId }: InvitationQueueFormProps) {
  const translate = useTranslate();
  const queue = useInvitationQueue(mailingListId);

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
      <h3 className="text-lg font-semibold">{queue.actionLabel}</h3>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <EventSelect value={queue.eventId} onChange={queue.setEventId} />
          <MembershipKindSelect
            label={translate("mailingLists.fields.kind")}
            value={queue.kind}
            onChange={queue.setKind}
          />
          <LocalizedTabs
            value={queue.previewLocale}
            onValueChange={queue.setPreviewLocale}
          >
            {(tabLocale) => (
              <>
                <LabeledField label={translate("mailingLists.fields.subject")}>
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
                <LabeledField label={translate("mailingLists.fields.body")}>
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
          subject={queue.subject[queue.previewLocale] || queue.subject.en}
          body={queue.body[queue.previewLocale] || queue.body.en}
        />
      </div>
    </section>
  );
}
