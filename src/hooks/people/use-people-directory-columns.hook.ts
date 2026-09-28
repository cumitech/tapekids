"use client";

import { useMemo, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";

import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatDate } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone";

export const PEOPLE_DIRECTORY_FIELDS = [
  "yfId",
  "fullName",
  "isTrophy",
  "email",
  "gender",
  "shirtSize",
  "phone",
  "dateOfBirth",
  "region",
  "town",
  "address",
] as const;

export type PeopleDirectoryRow = {
  id: string;
  yfId?: string | null;
  fullName?: string | null;
  isTrophy?: boolean;
  email?: string | null;
  gender?: string | null;
  shirtSize?: string | null;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  region?: string | null;
  town?: string | null;
  address?: string | null;
};

type UsePeopleDirectoryColumnsOptions<T extends PeopleDirectoryRow> = {
  renderActions?: (row: T) => ReactNode;
};

export function usePeopleDirectoryColumns<T extends PeopleDirectoryRow>(
  options?: UsePeopleDirectoryColumnsOptions<T>
) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const labels = useResourceLabels("people", PEOPLE_DIRECTORY_FIELDS);
  const renderActions = options?.renderActions;

  return useMemo<ColumnDef<T>[]>(() => {
    const columns: ColumnDef<T>[] = [
      {
        id: "yfId",
        accessorKey: "yfId",
        header: labels.fields.yfId,
      },
      {
        id: "fullName",
        accessorKey: "fullName",
        header: labels.fields.fullName,
      },
      {
        id: "isTrophy",
        accessorKey: "isTrophy",
        header: labels.fields.isTrophy,
        cell: ({ row }) => translate(row.original.isTrophy ? "yes" : "no"),
      },
      { id: "email", accessorKey: "email", header: labels.fields.email },
      {
        id: "gender",
        accessorKey: "gender",
        header: labels.fields.gender,
        cell: ({ row }) =>
          row.original.gender
            ? translate(`people.genders.${row.original.gender}`)
            : "-",
        ...columnFilter(),
      },
      {
        id: "shirtSize",
        accessorKey: "shirtSize",
        header: labels.fields.shirtSize,
        cell: ({ row }) =>
          row.original.shirtSize
            ? translate(`people.shirtSizes.${row.original.shirtSize}`)
            : "-",
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: labels.fields.phone,
        cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "-",
      },
      {
        id: "dateOfBirth",
        accessorKey: "dateOfBirth",
        header: labels.fields.dateOfBirth,
        cell: ({ row }) =>
          formatDate(row.original.dateOfBirth, locale) || "-",
      },
      {
        id: "region",
        accessorKey: "region",
        header: labels.fields.region,
        ...columnFilter(),
      },
      {
        id: "town",
        accessorKey: "town",
        header: labels.fields.town,
        ...columnFilter(),
      },
      {
        id: "address",
        accessorKey: "address",
        header: labels.fields.address,
      },
    ];

    if (renderActions) {
      columns.push({
        id: "actions",
        header: labels.tableActions,
        cell: ({ row }) => renderActions(row.original),
      });
    }

    return columns;
  }, [labels, locale, renderActions, translate]);
}
