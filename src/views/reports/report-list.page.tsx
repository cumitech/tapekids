"use client";

import { useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";
import { useParams } from "next/navigation";

import { ReportExportButton } from "@/components/reports/report-export-button";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import { ShowButton } from "@/components/shared/refine-ui/buttons/show";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/shared/refine-ui/views/list-view";
import {
  isPersonReportKind,
  isReportKind,
  REPORT_KINDS,
  reportPersonCategory,
  type PersonReportKind,
  type ReportKind,
} from "@/constants/reports";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { usePeopleDirectoryColumns } from "@/hooks/people/use-people-directory-columns.hook";
import type { Person } from "@/models/people/person.model";
import type { SponsorReportRow } from "@/models/reports/sponsor-report.model";
import type { WaitingListEntry } from "@/models/waiting-list/waiting-list.model";

function PersonShowButton({ id }: { id: string }) {
  return (
    <ShowButton
      resource="people"
      recordItemId={id}
      size="icon"
      variant="outline"
      className="size-11 md:size-8"
    />
  );
}

function PeopleReportTable({ kind }: { kind: PersonReportKind }) {
  const renderActions = useCallback(
    (row: Person) => <PersonShowButton id={row.id} />,
    []
  );
  const columns = usePeopleDirectoryColumns<Person>({
    renderActions,
  });
  const { table } = useCachedTable<Person>({
    resource: "people",
    columns,
    permanentFilters: [
      {
        field: "category",
        operator: "eq",
        value: reportPersonCategory(kind),
      },
    ],
  });

  return <DataTable table={table} />;
}

function MembershipReportTable({ resource }: { resource: string }) {
  const translate = useTranslate();
  const renderActions = useCallback(
    (row: SponsorReportRow) => <PersonShowButton id={row.personId} />,
    []
  );
  const directory = usePeopleDirectoryColumns<SponsorReportRow>({
    renderActions,
  });

  const columns = useMemo<ColumnDef<SponsorReportRow>[]>(
    () => [
      {
        id: "eventTitle",
        accessorKey: "eventTitle",
        header: translate("events.fields.title"),
      },
      {
        id: "status",
        accessorKey: "status",
        header: translate("payments.fields.status"),
        cell: ({ row }) =>
          translate(
            `portal.status.membership.${row.original.status}`,
            row.original.status
          ),
        ...columnFilter(),
      },
      ...directory,
    ],
    [directory, translate]
  );

  const { table } = useCachedTable<SponsorReportRow>({
    resource,
    columns,
  });

  return <DataTable table={table} />;
}

function WaitingListReportTable() {
  const translate = useTranslate();
  const columns = useMemo<ColumnDef<WaitingListEntry>[]>(
    () => [
      {
        id: "fullName",
        accessorKey: "fullName",
        header: translate("people.fields.fullName"),
      },
      {
        id: "email",
        accessorKey: "email",
        header: translate("people.fields.email"),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: translate("people.fields.phone"),
      },
    ],
    [translate]
  );
  const { table } = useCachedTable<WaitingListEntry>({
    resource: "reports/waiting-list",
    columns,
  });
  return <DataTable table={table} />;
}

export function ReportListPage() {
  const translate = useTranslate();
  const params = useParams();
  const rawKind = Array.isArray(params?.kind) ? params.kind[0] : params?.kind;

  if (!isReportKind(rawKind)) {
    return <ErrorComponent />;
  }

  const kind: ReportKind = rawKind;

  return (
    <ListView>
      <ListViewHeader
        resource="reports"
        canCreate={false}
        title={translate(`reports.kinds.${kind}.title`)}
      >
        <ReportExportButton kind={kind} />
      </ListViewHeader>
      {kind === REPORT_KINDS.SPONSORS ? (
        <MembershipReportTable resource="reports/sponsors" />
      ) : kind === REPORT_KINDS.PARTICIPANTS ? (
        <MembershipReportTable resource="reports/participants" />
      ) : kind === REPORT_KINDS.WAITING_LIST ? (
        <WaitingListReportTable />
      ) : isPersonReportKind(kind) ? (
        <PeopleReportTable kind={kind} />
      ) : (
        <ErrorComponent />
      )}
    </ListView>
  );
}
