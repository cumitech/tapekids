"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { Loader2 } from "lucide-react";

import { AssignYfIdButton } from "@/components/people/assign-yf-id-button";
import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Input } from "@/components/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { INVITATION_STATUSES } from "@/constants/event-participation";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPatch, apiPost } from "@/lib/client/api";
import { invalidateListCaches } from "@/lib/client/invalidate-lists";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type DeliveryCounts = {
  pending: number;
  success: number;
  failed: number;
  accepted: number;
  expired: number;
};

type DeliveryBatch = {
  id: string;
  subject: string;
  sentAt?: string | null;
  counts: DeliveryCounts;
};

type DeliveryRecipient = {
  id: string;
  personId: string;
  fullName: string;
  email: string;
  yfId?: string | null;
  status: string;
};

type RecipientFilter = "failed" | "pending" | "success" | "all";

const RETRYABLE = new Set<string>([
  INVITATION_STATUSES.FAILED,
  INVITATION_STATUSES.QUEUED,
  INVITATION_STATUSES.EXPIRED,
]);

function matchesFilter(status: string, filter: RecipientFilter) {
  if (filter === "all") {
    return true;
  }
  if (filter === "failed") {
    return status === INVITATION_STATUSES.FAILED;
  }
  if (filter === "pending") {
    return status === INVITATION_STATUSES.QUEUED;
  }
  return (
    status === INVITATION_STATUSES.SENT ||
    status === INVITATION_STATUSES.ACCEPTED
  );
}

function DeliveryStatus({ status }: { status: string }) {
  const translate = useTranslate();
  const tone =
    status === INVITATION_STATUSES.FAILED
      ? "bg-destructive text-white"
      : status === INVITATION_STATUSES.SENT ||
          status === INVITATION_STATUSES.ACCEPTED
        ? "bg-success text-success-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone
      )}
    >
      {translate(`mailingLists.deliveries.statuses.${status}`, status)}
    </span>
  );
}

export function InvitationRecipients({ batchId }: { batchId: string }) {
  const translate = useTranslate();
  const translateRef = useRef(translate);
  translateRef.current = translate;
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const [rows, setRows] = useState<DeliveryRecipient[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<RecipientFilter>("failed");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const load = useCallback(async () => {
    const result = await apiGet<DeliveryRecipient[]>(
      `/invitation-batches/${batchId}/recipients`
    );
    setRows(result);
    setError("");
    return result;
  }, [batchId]);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setSelected(new Set());
    setEditingId(null);
    apiGet<DeliveryRecipient[]>(`/invitation-batches/${batchId}/recipients`)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setRows(result);
        const failed = result.some(
          (row) => row.status === INVITATION_STATUSES.FAILED
        );
        const pending = result.some(
          (row) => row.status === INVITATION_STATUSES.QUEUED
        );
        setFilter(failed ? "failed" : pending ? "pending" : "all");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            apiErrorMessage(
              err,
              translateRef.current("mailingLists.deliveries.loadFailed")
            )
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const visible = useMemo(
    () => (rows ?? []).filter((row) => matchesFilter(row.status, filter)),
    [filter, rows]
  );
  const selectable = visible.filter((row) => RETRYABLE.has(row.status));
  const allSelected =
    selectable.length > 0 && selectable.every((row) => selected.has(row.id));

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      if (allSelected) {
        for (const row of selectable) {
          next.delete(row.id);
        }
      } else {
        for (const row of selectable) {
          next.add(row.id);
        }
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function resend() {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      return;
    }
    return run(async () => {
      const result = await apiPost<{ sentCount: number; failedCount: number }>(
        `/invitation-batches/${batchId}/resend`,
        { ids }
      );
      setSelected(new Set());
      await load();
      notify?.({
        type: result.sentCount > 0 ? "success" : "error",
        message: translate("mailingLists.deliveries.resendDone", {
          sent: result.sentCount,
          failed: result.failedCount,
        }),
      });
    }, translate("mailingLists.deliveries.resendFailed"));
  }

  function saveEmail(row: DeliveryRecipient) {
    setEmailError("");
    return run(async () => {
      try {
        await apiPatch(`/invitation-recipients/${row.id}/email`, {
          email: draftEmail,
        });
      } catch (err) {
        setEmailError(
          apiErrorMessage(err, translate("mailingLists.deliveries.emailFailed"))
        );
        return;
      }
      invalidateListCaches("people", "mailing-lists");
      setEditingId(null);
      await load();
      notify?.({
        type: "success",
        message: translate("mailingLists.deliveries.emailSaved"),
      });
    }, translate("mailingLists.deliveries.emailFailed"));
  }

  const filters: RecipientFilter[] = ["failed", "pending", "success", "all"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {translate(`mailingLists.deliveries.${item}`)}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!rows && !error ? (
        <Loader2 className="size-5 animate-spin text-primary" />
      ) : null}
      {rows ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={
                !integrations.mailEnabled || busy || selected.size === 0
              }
              onClick={() => void resend()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {translate("mailingLists.deliveries.resend")}
            </Button>
            {selected.size > 0 ? (
              <span className="text-sm text-muted-foreground">
                {translate("mailingLists.deliveries.selected", {
                  count: selected.size,
                })}
              </span>
            ) : null}
          </div>
          <div className="max-h-[28rem] overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      disabled={selectable.length === 0}
                      onCheckedChange={toggleAll}
                      aria-label={translate("mailingLists.deliveries.selectAll")}
                    />
                  </TableHead>
                  <TableHead>{translate("people.fields.fullName")}</TableHead>
                  <TableHead>{translate("mailingLists.fields.email")}</TableHead>
                  <TableHead className="w-28">
                    {translate("mailingLists.deliveries.status")}
                  </TableHead>
                  <TableHead className="w-36">
                    <span className="sr-only">
                      {translate("mailingLists.deliveries.editEmail")}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      {translate("mailingLists.deliveries.noneInFilter")}
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((row) => {
                    const retryable = RETRYABLE.has(row.status);
                    const editing = editingId === row.id;
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          {retryable ? (
                            <Checkbox
                              checked={selected.has(row.id)}
                              onCheckedChange={() => toggleRow(row.id)}
                              aria-label={translate(
                                "mailingLists.deliveries.selectRow"
                              )}
                            />
                          ) : null}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.fullName || "—"}
                        </TableCell>
                        <TableCell>
                          {editing ? (
                            <div className="flex min-w-0 flex-col gap-2">
                              <Input
                                type="email"
                                value={draftEmail}
                                autoFocus
                                onChange={(event) =>
                                  setDraftEmail(event.target.value)
                                }
                              />
                              {emailError ? (
                                <p className="text-sm text-destructive">
                                  {emailError}
                                </p>
                              ) : null}
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={busy || !draftEmail.trim()}
                                  onClick={() => void saveEmail(row)}
                                >
                                  {translate("mailingLists.deliveries.saveEmail")}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                >
                                  {translate("buttons.cancel")}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {row.email || "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DeliveryStatus status={row.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {row.personId ? (
                              <AssignYfIdButton
                                personId={row.personId}
                                fullName={row.fullName}
                                yfId={row.yfId}
                                onSaved={() => {
                                  void load();
                                }}
                              />
                            ) : null}
                            {retryable && !editing ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(row.id);
                                  setDraftEmail(row.email);
                                  setEmailError("");
                                }}
                              >
                                {translate("mailingLists.deliveries.editEmail")}
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MailingListDeliveries({
  mailingListId,
  focusBatchId,
}: {
  mailingListId: string;
  focusBatchId?: string | null;
}) {
  const translate = useTranslate();
  const translateRef = useRef(translate);
  translateRef.current = translate;
  const { locale } = useLocale();
  const [batches, setBatches] = useState<DeliveryBatch[] | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<DeliveryBatch[]>(
      `/mailing-lists/${mailingListId}/invitation-batches`
    )
      .then((result) => {
        if (cancelled) {
          return;
        }
        setBatches(result);
        setError("");
        if (focusBatchId) {
          setOpenId(focusBatchId);
          return;
        }
        setOpenId((current) => {
          if (current && result.some((batch) => batch.id === current)) {
            return current;
          }
          return result[0]?.counts.failed ? result[0].id : null;
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            apiErrorMessage(
              err,
              translateRef.current("mailingLists.deliveries.loadFailed")
            )
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [focusBatchId, mailingListId]);

  return (
    <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
      <h3 className="mb-3 text-lg font-semibold">
        {translate("mailingLists.deliveries.title")}
      </h3>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!batches && !error ? (
        <Loader2 className="size-5 animate-spin text-primary" />
      ) : null}
      {batches && batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("mailingLists.deliveries.empty")}
        </p>
      ) : null}
      {batches && batches.length > 0 ? (
        <ul className="divide-y overflow-hidden rounded-md border">
          {batches.map((batch) => {
            const open = openId === batch.id;
            const sent = batch.counts.success + batch.counts.accepted;
            return (
              <li key={batch.id}>
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-3 text-left hover:bg-muted/40"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : batch.id)}
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{batch.subject}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {translate("mailingLists.deliveries.summary", {
                        success: sent,
                        failed: batch.counts.failed,
                        pending: batch.counts.pending,
                      })}
                      {batch.sentAt
                        ? ` · ${formatDateTime(batch.sentAt, locale)}`
                        : ""}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {translate(
                      open
                        ? "mailingLists.deliveries.close"
                        : "mailingLists.deliveries.open"
                    )}
                  </span>
                </button>
                {open ? (
                  <div className="border-t bg-muted/20 px-3 py-3">
                    <InvitationRecipients batchId={batch.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
