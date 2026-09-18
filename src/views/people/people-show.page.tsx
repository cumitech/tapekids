"use client";

import { useShow, useTranslate } from "@refinedev/core";

import { PersonForm } from "@/components/people/person-form.component";
import { PaymentList } from "@/components/payments/payment-list";
import { RecordDetails } from "@/components/shared/record-details";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/shared/refine-ui/views/show-view";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatPhoneDisplay } from "@/lib/phone";
import {
  guardiansFromRecord,
  type Person,
} from "@/models/people/person.model";

const PERSON_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "address",
  "churchName",
  "churchPastorName",
  "churchAddress",
  "town",
  "region",
  "division",
  "subDivision",
  "medicalNotes",
] as const;

export function PeopleShowPage() {
  const translate = useTranslate();
  const { openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("people", PERSON_FIELDS);
  const { query } = useShow<Person>({ resource: "people" });
  const record = query.data?.data;
  const guardians = guardiansFromRecord(record).filter(
    (guardian) => guardian.name || guardian.phone
  );

  return (
    <ShowView>
      <ShowViewHeader
        title={labels.titles.show}
        onEdit={
          record
            ? () =>
                openEdit("people", record.id, ({ close }) => (
                  <PersonForm
                    mode="edit"
                    id={record.id}
                    onCancel={close}
                    onSuccess={() => {
                      close();
                      void query.refetch();
                    }}
                  />
                ))
            : undefined
        }
      />
      {record ? (
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <RecordDetails
              labels={labels.fields}
              fields={Object.fromEntries(
                PERSON_FIELDS.map((key) => [
                  key,
                  key === "gender" && record.gender
                    ? translate(`people.genders.${record.gender}`)
                    : record[key],
                ])
              )}
            />
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#182356] dark:text-foreground">
                {translate("people.sections.guardians", "Parents / guardians")}
              </h3>
              {guardians.length === 0 ? (
                <p className="text-sm text-muted-foreground">-</p>
              ) : (
                <dl className="grid gap-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] sm:grid-cols-2 dark:bg-card">
                  {guardians.map((guardian, index) => (
                    <div key={`${guardian.name}-${index}`} className="contents">
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm text-muted-foreground">
                          {translate(
                            "people.guardianRow",
                            { n: index + 1 },
                            "Guardian {{n}}"
                          )}
                        </dt>
                        <dd>{guardian.name || "-"}</dd>
                      </div>
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm text-muted-foreground">
                          {labels.fields.phone}
                        </dt>
                        <dd>
                          {formatPhoneDisplay(guardian.phone) ||
                            guardian.phone ||
                            "-"}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          </div>
          <aside className="min-w-0">
            <PaymentList compact personId={record.id} />
          </aside>
        </div>
      ) : null}
    </ShowView>
  );
}
