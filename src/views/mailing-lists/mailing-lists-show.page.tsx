"use client";

import { useShow, useTranslate } from "@refinedev/core";

import { InvitationQueueForm } from "@/components/invitations/invitation-queue-form";
import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { useAppModal } from "@/components/shared/modals/app-modal";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { Button } from "@/components/shared/ui/button";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { apiDelete } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import { PORTAL_SURFACE } from "@/constants/layout";
import type { MailingList } from "@/models/mailing-lists/mailing-list.model";

export function MailingListsShowPage() {
  const translate = useTranslate();
  const { confirm } = useAppModal();
  const { openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("mailingLists", ["name", "audienceKind"]);
  const { query } = useShow<MailingList>({ resource: "mailing-lists" });
  const record = query.data?.data;
  const { busy, run } = useBusyAction();

  const members = record?.members ?? [];

  return (
    <ShowView>
      <ShowViewHeader
        title={record?.name ?? labels.titles.show}
        onEdit={
          record
            ? () =>
                openEdit(
                  "mailingLists",
                  record.id,
                  ({ close }) => (
                    <MailingListForm
                      mode="edit"
                      id={record.id}
                      onCancel={close}
                      onSuccess={() => {
                        close();
                        void query.refetch();
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
            {labels.fields.audienceKind}:{" "}
            {translate(
              `mailingLists.audienceKinds.${record.audienceKind}`,
              record.audienceKind
            )}
          </p>

          <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
            <h3 className="mb-3 text-lg font-semibold">
              {translate("mailingLists.members")}
            </h3>
            <ul className="divide-y rounded-md border bg-white dark:bg-card">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span>
                    {member.person
                      ? `${member.person.firstName} ${member.person.lastName} (${member.person.email})`
                      : member.personId}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      confirm({
                        title: translate("buttons.confirm"),
                        destructive: true,
                        onConfirm: () =>
                          run(async () => {
                            await apiDelete(
                              `/mailing-lists/${record.id}/members/${member.personId}`
                            );
                            await query.refetch();
                          }, translate("mailingLists.memberRemoveFailed")),
                      })
                    }
                  >
                    {translate("actions.delete")}
                  </Button>
                </li>
              ))}
              {members.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  {translate("empty")}
                </li>
              ) : null}
            </ul>
          </section>

          <InvitationQueueForm mailingListId={record.id} />
        </div>
      ) : null}
    </ShowView>
  );
}
