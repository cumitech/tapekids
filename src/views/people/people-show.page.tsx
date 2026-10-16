"use client";

import { AssignYfIdButton } from "@/components/people/assign-yf-id-button";
import { PersonForm } from "@/components/people/person-form.component";
import { PaymentList } from "@/components/payments/payment-list";
import { RecordDetails } from "@/components/shared/record-details";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { usePeopleShowPage } from "@/hooks/people/use-people-show.hook";
import { PersonGuardians } from "@/views/people/person-guardians";
import { PersonTrophy } from "@/views/people/person-trophy";

export function PeopleShowPage() {
  const page = usePeopleShowPage();
  const { record, labels, translate } = page;

  return (
    <ShowView>
      <ShowViewHeader
        title={record?.fullName || labels.titles.show}
        ornament={
          record?.isTrophy ? (
            <PersonTrophy label={labels.fields.isTrophy} />
          ) : null
        }
        stats={
          record
            ? [
                {
                  label: labels.fields.yfId,
                  value: record.yfId?.trim() || "—",
                  accent: "ivory",
                },
                {
                  label: labels.fields.points,
                  value: record.points ?? 0,
                  accent: "gold",
                },
              ]
            : undefined
        }
        onEdit={
          record
            ? () =>
                page.openEdit("people", record.id, ({ close }) => (
                  <PersonForm
                    mode="edit"
                    id={record.id}
                    onCancel={close}
                    onSuccess={() => {
                      close();
                      page.refetch();
                    }}
                  />
                ))
            : undefined
        }
      />
      {record ? (
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <div>
              <AssignYfIdButton
                personId={record.id}
                fullName={record.fullName}
                yfId={record.yfId}
                onSaved={page.refetch}
              />
            </div>
            <RecordDetails labels={labels.fields} fields={page.detailFields} />
          </div>
          <aside className="flex min-w-0 flex-col gap-8">
            <PersonGuardians
              title={translate("people.sections.guardians")}
              emptyLabel="-"
              phoneLabel={labels.fields.phone}
              rowLabel={(n) => translate("people.guardianRow", { n })}
              formatPhone={page.formatGuardianPhone}
              guardians={page.guardians}
            />
            <PaymentList compact personId={record.id} />
          </aside>
        </div>
      ) : null}
    </ShowView>
  );
}
