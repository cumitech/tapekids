"use client";

import { useMemo, useRef, useState, type MutableRefObject } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { useNotification, useTranslate } from "@refinedev/core";

import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { unwrapEnvelope } from "@/lib/client/api";
import { invalidateListCaches } from "@/lib/client/invalidate-lists";
import { formatDateTime } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone";
import { waitingListEventTitle } from "@/lib/waiting-list/event-title";
import type { WaitingListEntry } from "@/models/waiting-list/waiting-list.model";
import { http } from "@/utils/axios";

export function useWaitingListPage() {
  const translate = useTranslate();
  const { open } = useNotification();
  const { locale } = useLocale();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const selectedRef = useRef(selected);
  const busyRef = useRef(busy);
  const recordsRef = useRef<WaitingListEntry[]>([]);
  const approveRef = useRef<(ids: string[]) => Promise<void>>(async () => {});
  selectedRef.current = selected;
  busyRef.current = busy;

  const columns = useWaitingListColumns({
    locale,
    selectedRef,
    recordsRef,
    busyRef,
    onToggle: (id, checked) => {
      setSelected((current) => {
        const next = new Set(current);
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    onTogglePage: (ids, checked) => {
      setSelected((current) => {
        const next = new Set(current);
        for (const id of ids) {
          if (checked) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return next;
      });
    },
    onApprove: (ids) => {
      void approveRef.current(ids);
    },
  });

  const { table, records } = useCachedTable<WaitingListEntry>({
    resource: "waiting-list",
    columns,
  });
  recordsRef.current = records;

  approveRef.current = async (ids: string[]) => {
    if (!ids.length || busyRef.current) {
      return;
    }
    setBusy(true);
    try {
      const { data } = await http.post("/waiting-list/approve", { ids });
      const result = unwrapEnvelope<{ approved: number; failed: number }>(data);
      invalidateListCaches("waiting-list");
      setSelected(new Set());
      await table.refineCore.tableQuery.refetch();
      open?.({
        type: result.failed > 0 ? "error" : "success",
        message:
          result.failed > 0
            ? translate("waitingList.approvedPartial", {
                approved: result.approved,
                failed: result.failed,
              })
            : translate("waitingList.approved"),
      });
    } catch (error) {
      open?.({
        type: "error",
        message: messageFromError(error, translate("waitingList.approveFailed")),
      });
    } finally {
      setBusy(false);
    }
  };

  return {
    translate,
    table,
    busy,
    selectedCount: selected.size,
    approveSelected: () => void approveRef.current(Array.from(selected)),
  };
}

function useWaitingListColumns({
  locale,
  onToggle,
  onTogglePage,
  onApprove,
  selectedRef,
  recordsRef,
  busyRef,
}: {
  locale: string;
  onToggle: (id: string, checked: boolean) => void;
  onTogglePage: (ids: string[], checked: boolean) => void;
  onApprove: (ids: string[]) => void;
  selectedRef: MutableRefObject<Set<string>>;
  recordsRef: MutableRefObject<WaitingListEntry[]>;
  busyRef: MutableRefObject<boolean>;
}) {
  const translate = useTranslate();
  const actionsRef = useRef({ onToggle, onTogglePage, onApprove });
  actionsRef.current = { onToggle, onTogglePage, onApprove };

  return useMemo<ColumnDef<WaitingListEntry>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => {
          const ids = recordsRef.current.map((row) => row.id);
          const selectedCount = ids.filter((id) =>
            selectedRef.current.has(id)
          ).length;
          const checked =
            ids.length > 0 && selectedCount === ids.length
              ? true
              : selectedCount > 0
                ? "indeterminate"
                : false;
          return (
            <Checkbox
              checked={checked}
              disabled={busyRef.current || ids.length === 0}
              aria-label={translate("waitingList.selectAll")}
              onCheckedChange={(value) =>
                actionsRef.current.onTogglePage(ids, value === true)
              }
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRef.current.has(row.original.id)}
            disabled={busyRef.current}
            aria-label={translate("waitingList.select")}
            onCheckedChange={(value) =>
              actionsRef.current.onToggle(row.original.id, value === true)
            }
          />
        ),
      },
      {
        id: "fullName",
        accessorKey: "fullName",
        header: translate("people.fields.fullName"),
      },
      {
        id: "yfId",
        accessorKey: "yfId",
        header: translate("people.fields.yfId"),
        cell: ({ row }) => row.original.yfId || "-",
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
        cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "-",
      },
      {
        id: "event",
        enableSorting: false,
        header: translate("waitingList.event"),
        cell: ({ row }) => waitingListEventTitle(row.original) || "-",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: translate("waitingList.registeredAt"),
        cell: ({ row }) => formatDateTime(row.original.createdAt, locale) || "-",
      },
      {
        id: "actions",
        enableSorting: false,
        header: translate("table.actions"),
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busyRef.current}
            onClick={() => actionsRef.current.onApprove([row.original.id])}
          >
            {translate("waitingList.approve")}
          </Button>
        ),
      },
    ],
    [busyRef, locale, recordsRef, selectedRef, translate]
  );
}

function messageFromError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message && message !== "Validation failed") {
      return message;
    }
  }
  return fallback;
}
