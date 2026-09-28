"use client";

import { useShow, useTranslate } from "@refinedev/core";
import { Trophy } from "lucide-react";

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
  "fullName",
  "isTrophy",
  "category",
  "email",
  "phone",
  "yfId",
  "points",
  "ageYears",
  "dateOfBirth",
  "gender",
  "shirtSize",
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

function PersonTrophy({ label }: { label: string }) {
  return (
    <span
      className="relative inline-flex size-10 shrink-0 items-center justify-center sm:size-11"
      title={label}
      aria-label={label}
    >
      <span className="absolute inset-0 animate-pulse rounded-full bg-[#f59f21]/35" />
      <span className="relative flex size-9 items-center justify-center rounded-full bg-[#f59f21] shadow-[0_0_16px_rgba(245,159,33,0.75)] sm:size-10">
        <Trophy
          className="size-5 fill-[#fff4d6] text-[#7a4e08] [animation:trophy-gleam_2.2s_ease-in-out_infinite] sm:size-6"
          aria-hidden
        />
      </span>
    </span>
  );
}

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
                    : key === "shirtSize" && record.shirtSize
                      ? translate(`people.shirtSizes.${record.shirtSize}`)
                      : key === "category" && record.category
                      ? translate(`people.categories.${record.category}`)
                      : record[key as keyof Person],
                ])
              )}
            />
          </div>
          <aside className="flex min-w-0 flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#182356] dark:text-foreground">
                {translate("people.sections.guardians")}
              </h3>
              {guardians.length === 0 ? (
                <p className="text-sm text-muted-foreground">-</p>
              ) : (
                <dl className="grid gap-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
                  {guardians.map((guardian, index) => (
                    <div key={`${guardian.name}-${index}`} className="contents">
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm text-muted-foreground">
                          {translate("people.guardianRow", { n: index + 1 })}
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
            <PaymentList compact personId={record.id} />
          </aside>
        </div>
      ) : null}
    </ShowView>
  );
}
