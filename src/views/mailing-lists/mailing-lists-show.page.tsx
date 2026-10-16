"use client";

import { CalendarIcon, MailCheckIcon } from "lucide-react";

import { MailingListDeliveries } from "@/components/invitations/invitation-deliveries";
import { InvitationQueueForm } from "@/components/invitations/invitation-queue-form";
import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { DeleteConfirmPopover } from "@/components/shared/refine-ui/buttons/delete-confirm-popover";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { PORTAL_SURFACE } from "@/constants/layout";
import {
  memberIsInvited,
  useMailingListsShowPage,
} from "@/hooks/mailing-lists/use-mailing-lists-show.hook";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MailingListsShowPage() {
  const page = useMailingListsShowPage();
  const { record, labels, translate, locale } = page;

  return (
    <ShowView>
      <ShowViewHeader
        title={record?.name ?? labels.titles.show}
        onEdit={
          record
            ? () =>
                page.openEdit(
                  "mailingLists",
                  record.id,
                  ({ close }) => (
                    <MailingListForm
                      mode="edit"
                      id={record.id}
                      onCancel={close}
                      onSuccess={() => {
                        close();
                        page.refetch();
                      }}
                    />
                  ),
                  "sm:max-w-3xl"
                )
            : undefined
        }
      />
      {record ? (
        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground">
            {labels.fields.audienceKind}: {page.audienceLabel}
          </p>

          <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {translate("mailingLists.members")} ({page.members.length})
              </h3>
            </div>
            <ul className="divide-y rounded-md border bg-white dark:bg-card">
              {page.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="truncate text-sm font-medium">
                      {member.person
                        ? member.person.fullName
                        : member.personId}
                    </span>
                    {member.person?.email ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {member.person.email}
                      </span>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 sm:pt-0">
                      {member.person?.importedAt ? (
                        <Badge
                          variant="outline"
                          className="gap-1 text-[11px] font-normal text-muted-foreground"
                        >
                          <CalendarIcon className="size-3 opacity-70" />
                          {translate("mailingLists.importedBadge", {
                            date: formatDate(member.person.importedAt, locale),
                          })}
                        </Badge>
                      ) : null}
                      {memberIsInvited(member.person) ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        >
                          <MailCheckIcon className="size-3" />
                          {translate("mailingLists.invitedBadge", "Invited")}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <DeleteConfirmPopover
                    disabled={page.busy}
                    onConfirm={() => page.removeMember(member.personId)}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={page.busy}
                    >
                      {translate("actions.delete")}
                    </Button>
                  </DeleteConfirmPopover>
                </li>
              ))}
              {page.members.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  {translate("empty")}
                </li>
              ) : null}
            </ul>
          </section>

          <InvitationQueueForm
            mailingListId={record.id}
            onSent={(result) =>
              page.setFocusBatchId(result.batch?.id ?? null)
            }
          />
          <MailingListDeliveries
            mailingListId={record.id}
            focusBatchId={page.focusBatchId}
          />
        </div>
      ) : null}
    </ShowView>
  );
}
