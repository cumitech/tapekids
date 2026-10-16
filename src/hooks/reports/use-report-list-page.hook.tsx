"use client";

import { useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";
import { useParams } from "next/navigation";

import { PersonShowButton } from "@/components/reports/person-show-button";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import {
  isReportKind,
  REPORT_KINDS,
  reportPersonCategory,
  type PersonReportKind,
  type ReportKind,
} from "@/constants/reports";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { usePeopleDirectoryColumns } from "@/hooks/people/use-people-directory-columns.hook";
import { waitingListEventTitle } from "@/lib/waiting-list/event-title";
import type { Person } from "@/models/people/person.model";
import type { SponsorReportRow } from "@/models/reports/sponsor-report.model";
import type { WaitingListEntry } from "@/models/waiting-list/waiting-list.model";

export function useReportListPage() {
  const translate = useTranslate();
  const params = useParams();
  const rawKind = Array.isArray(params?.kind) ? params.kind[0] : params?.kind;
  const valid = isReportKind(rawKind);
  const kind: ReportKind | null = valid ? rawKind : null;

  return {
    translate,
    valid,
    kind,
    title: kind ? translate(`reports.kinds.${kind}.title`) : "",
    isSponsors: kind === REPORT_KINDS.SPONSORS,
    isParticipants: kind === REPORT_KINDS.PARTICIPANTS,
    isTrophyCampers: kind === REPORT_KINDS.TROPHY_CAMPERS,
    isTrophyParticipants: kind === REPORT_KINDS.TROPHY_PARTICIPANTS,
    isWaitingList: kind === REPORT_KINDS.WAITING_LIST,
    isChaperones: kind === REPORT_KINDS.CHAPERONES,
  };
}

export function usePeopleReportTable(kind: PersonReportKind) {
  const renderActions = useCallback(
    (row: Person) => <PersonShowButton id={row.id} />,
    []
  );
  const columns = usePeopleDirectoryColumns<Person>({
    renderActions,
  });
  return useCachedTable<Person>({
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
}

export function useMembershipReportTable(resource: string) {
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

  return useCachedTable<SponsorReportRow>({
    resource,
    columns,
  });
}

export function useWaitingListReportTable() {
  const translate = useTranslate();
  const columns = useMemo<ColumnDef<WaitingListEntry>[]>(
    () => [
      {
        id: "event",
        enableSorting: false,
        header: translate("waitingList.event"),
        cell: ({ row }) => waitingListEventTitle(row.original) || "-",
      },
      {
        id: "status",
        accessorKey: "status",
        header: translate("payments.fields.status"),
        cell: ({ row }) =>
          translate(
            `waitingList.status.${row.original.status}`,
            row.original.status ?? ""
          ),
      },
      {
        id: "yfId",
        accessorKey: "yfId",
        header: translate("people.fields.yfId"),
        cell: ({ row }) => row.original.yfId || "-",
      },
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
  return useCachedTable<WaitingListEntry>({
    resource: "reports/waiting-list",
    columns,
  });
}
