"use client";

import { useEffect, useMemo, useState } from "react";
import { useList, useTranslate } from "@refinedev/core";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  FilterIcon,
  LayersIcon,
  MailCheckIcon,
  XIcon,
} from "lucide-react";

import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import type { PersonCategory } from "@/constants/person";
import { cn } from "@/lib/utils";
import type { Person } from "@/models/people/person.model";
import type { ImportBatchInfo } from "@/models/people/people-import.model";
import { apiGet } from "@/lib/client/api";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { formatDateTime } from "@/lib/format";

type MailingListPeoplePickerProps = {
  category: PersonCategory | null;
  value: string[];
  onChange: (personIds: string[]) => void;
};

interface PersonGroup {
  key: string;
  label: string;
  importedAt: string | null;
  items: Person[];
  invitedCount: number;
}

function personLabel(person: Pick<Person, "fullName" | "email">) {
  const name = person.fullName || person.email || "";
  return person.email ? `${name} (${person.email})` : name;
}

export function MailingListPeoplePicker({
  category,
  value,
  onChange,
}: MailingListPeoplePickerProps) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [batches, setBatches] = useState<ImportBatchInfo[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const selected = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    if (!category) {
      setBatches([]);
      setSelectedBatch("all");
      return;
    }
    let active = true;
    apiGet<ImportBatchInfo[]>(`/people/import-batches?category=${category}`)
      .then((data) => {
        if (active) {
          setBatches(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setBatches([]);
        }
      });
    return () => {
      active = false;
    };
  }, [category]);

  const filters = useMemo(() => {
    if (!category) {
      return [];
    }
    const next: Array<{
      field: string;
      operator: "eq" | "contains";
      value: string;
    }> = [
      {
        field: "category",
        operator: "eq",
        value: category,
      },
    ];
    if (selectedBatch !== "all") {
      next.push({
        field: "importedAt",
        operator: "eq",
        value: selectedBatch,
      });
    }
    if (search.trim()) {
      next.push({
        field: "q",
        operator: "contains",
        value: search.trim(),
      });
    }
    return next;
  }, [category, search, selectedBatch]);

  const { query } = useList<Person>({
    resource: "people",
    pagination: { currentPage: 1, pageSize: 500 },
    sorters: [
      { field: "importedAt", order: "desc" },
      { field: "fullName", order: "asc" },
    ],
    filters,
    queryOptions: {
      enabled: Boolean(category),
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const people = useMemo(() => {
    if (!category) {
      return [];
    }
    return (
      (query as { result?: { data?: Person[] }; data?: { data?: Person[] } })
        .result?.data ??
      query.data?.data ??
      []
    );
  }, [category, query]);
  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people]
  );

  const groups = useMemo<PersonGroup[]>(() => {
    if (!people.length) return [];

    const map = new Map<
      string,
      {
        label: string;
        importedAt: string | null;
        items: Person[];
        invitedCount: number;
      }
    >();
    const batchLabelMap = new Map(batches.map((b) => [b.importedAt, b.label]));

    for (const person of people) {
      const rawImportedAt = person.importedAt ?? null;
      const key = rawImportedAt
        ? new Date(rawImportedAt).toISOString()
        : "manual";
      let group = map.get(key);
      if (!group) {
        let label = "";
        if (rawImportedAt) {
          const matchedLabel =
            batchLabelMap.get(rawImportedAt) ||
            batchLabelMap.get(new Date(rawImportedAt).toISOString());
          if (matchedLabel) {
            label = translate("mailingLists.groups.importedOn", {
              date: matchedLabel,
            });
          } else {
            const formatted =
              formatDateTime(rawImportedAt, locale) || rawImportedAt;
            label = translate("mailingLists.groups.importedOn", {
              date: formatted,
            });
          }
        } else {
          label = translate(
            "mailingLists.groups.manual",
            "Manual Entry / Other"
          );
        }
        group = {
          label,
          importedAt: rawImportedAt,
          items: [],
          invitedCount: 0,
        };
        map.set(key, group);
      }
      group.items.push(person);
      if (person.invitations && person.invitations.length > 0) {
        group.invitedCount += 1;
      }
    }

    const groupList: PersonGroup[] = Array.from(map.entries()).map(
      ([key, data]) => ({
        key,
        label: data.label,
        importedAt: data.importedAt,
        items: data.items,
        invitedCount: data.invitedCount,
      })
    );

    // Sort: newest import batches first, manual at bottom
    groupList.sort((a, b) => {
      if (!a.importedAt) return 1;
      if (!b.importedAt) return -1;
      return (
        new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
      );
    });

    return groupList;
  }, [people, batches, locale, translate]);

  const allVisibleSelected =
    people.length > 0 && people.every((person) => selected.has(person.id));

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  };

  const toggleGroup = (group: PersonGroup) => {
    const next = new Set(selected);
    const allInGroupSelected =
      group.items.length > 0 &&
      group.items.every((p) => next.has(p.id));

    if (allInGroupSelected) {
      for (const p of group.items) {
        next.delete(p.id);
      }
    } else {
      for (const p of group.items) {
        next.add(p.id);
      }
    }
    onChange(Array.from(next));
  };

  const selectAll = async () => {
    if (!category) {
      return;
    }
    const params = new URLSearchParams();
    params.set("idsOnly", "true");
    params.set("category", category);
    if (selectedBatch !== "all") {
      params.set("importedAt", selectedBatch);
    }
    if (search.trim()) {
      params.set("q", search.trim());
    }
    setBusy(true);
    try {
      const matches = await apiGet<Array<{ id: string }>>(
        `/people?${params.toString()}`
      );
      const next = new Set(selected);
      for (const p of matches) {
        next.add(p.id);
      }
      onChange(Array.from(next));
    } finally {
      setBusy(false);
    }
  };

  const selectedBatchCounts = useMemo(() => {
    if (value.length === 0) return [];
    const counts = new Map<string, { label: string; count: number }>();
    const batchLabelMap = new Map(batches.map((b) => [b.importedAt, b.label]));

    for (const id of value) {
      const person = peopleById.get(id);
      const rawImportedAt = person?.importedAt ?? null;
      const key = rawImportedAt
        ? new Date(rawImportedAt).toISOString()
        : "manual";
      let entry = counts.get(key);
      if (!entry) {
        let label = "";
        if (rawImportedAt) {
          const matchedLabel =
            batchLabelMap.get(rawImportedAt) ||
            batchLabelMap.get(new Date(rawImportedAt).toISOString());
          if (matchedLabel) {
            label = translate("mailingLists.groups.importedOn", {
              date: matchedLabel,
            });
          } else {
            const formatted =
              formatDateTime(rawImportedAt, locale) || rawImportedAt;
            label = translate("mailingLists.groups.importedOn", {
              date: formatted,
            });
          }
        } else {
          label = translate(
            "mailingLists.groups.manual",
            "Manual Entry / Other"
          );
        }
        entry = { label, count: 0 };
        counts.set(key, entry);
      }
      entry.count += 1;
    }
    return Array.from(counts.values());
  }, [value, peopleById, batches, locale, translate]);

  const triggerLabel =
    value.length === 0
      ? translate(
          "mailingLists.pickCampersPlaceholder",
          "Search and select campers"
        )
      : value.length === 1
        ? peopleById.get(value[0])
          ? personLabel(peopleById.get(value[0]) as Person)
          : translate("mailingLists.selectedCount", { count: 1 })
        : translate("mailingLists.selectedCount", { count: value.length });

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Label>{translate("mailingLists.pickCampers", "Select campers")}</Label>
        {batches.length > 1 ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FilterIcon className="size-3.5 shrink-0 opacity-70" />
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="h-7 w-[220px] text-xs">
                <SelectValue
                  placeholder={translate(
                    "mailingLists.allBatches",
                    "All imports"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {translate("mailingLists.allBatches", "All imports")}
                </SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.importedAt} value={batch.importedAt}>
                    {batch.label} ({batch.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span
              className={cn(
                "truncate",
                value.length === 0 && "text-muted-foreground"
              )}
            >
              {triggerLabel}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={translate(
                "mailingLists.searchCampers",
                "Search by name or email"
              )}
            />
            <CommandList className="max-h-[380px] overflow-y-auto">
              <CommandEmpty>
                {translate("empty", "No records found")}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="select-all"
                  disabled={busy || !category}
                  onSelect={() => {
                    void selectAll();
                  }}
                  className="cursor-pointer"
                >
                  <CheckIcon
                    className={cn(
                      "size-4 shrink-0",
                      allVisibleSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-medium">
                    {selectedBatch !== "all"
                      ? translate(
                          "mailingLists.selectBatchOnly",
                          "Select only this batch"
                        )
                      : translate("mailingLists.selectAll", "Select all")}
                  </span>
                </CommandItem>
                {value.length > 0 ? (
                  <CommandItem
                    value="clear-selection"
                    onSelect={() => onChange([])}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <XIcon className="size-4 shrink-0" />
                    <span>
                      {translate("mailingLists.clearSelection", "Clear selection")}
                    </span>
                  </CommandItem>
                ) : null}
              </CommandGroup>

              {groups.map((group) => {
                const isAllGroupSelected =
                  group.items.length > 0 &&
                  group.items.every((p) => selected.has(p.id));

                return (
                  <div key={group.key} className="border-t border-border/60">
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-muted/90 px-3 py-1.5 backdrop-blur-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {group.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {translate("mailingLists.groups.groupSummary", {
                            count: group.items.length,
                            invited: group.invitedCount,
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleGroup(group);
                        }}
                        className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-primary hover:bg-background/80 hover:underline cursor-pointer transition-colors"
                      >
                        {isAllGroupSelected
                          ? translate(
                              "mailingLists.deselectGroup",
                              "Deselect group"
                            )
                          : translate(
                              "mailingLists.selectGroup",
                              "Select group"
                            )}
                      </button>
                    </div>

                    <CommandGroup>
                      {group.items.map((person) => {
                        const isPersonSelected = selected.has(person.id);
                        const hasInvite =
                          person.invitations && person.invitations.length > 0;

                        return (
                          <CommandItem
                            key={person.id}
                            value={person.id}
                            onSelect={() => toggle(person.id)}
                            className="flex items-center justify-between gap-2 py-1.5 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckIcon
                                className={cn(
                                  "size-4 shrink-0",
                                  isPersonSelected
                                    ? "opacity-100 text-primary"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-medium">
                                  {person.fullName}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                                  {person.email ? (
                                    <span className="truncate">
                                      {person.email}
                                    </span>
                                  ) : null}
                                  {person.phone ? (
                                    <span>{person.phone}</span>
                                  ) : null}
                                  {person.yfId ? (
                                    <span className="font-mono text-[10px] text-primary/80">
                                      YF: {person.yfId}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            {hasInvite ? (
                              <Badge
                                variant="outline"
                                className="shrink-0 gap-1 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              >
                                <MailCheckIcon className="size-3" />
                                {translate(
                                  "mailingLists.invitedBadge",
                                  "Invited"
                                )}
                              </Badge>
                            ) : null}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </div>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Group distribution summary badge bar if multiple batches selected */}
      {selectedBatchCounts.length > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <LayersIcon className="size-3.5 shrink-0 opacity-70" />
          {selectedBatchCounts.map((b) => (
            <Badge
              key={b.label}
              variant="secondary"
              className="px-2 py-0.5 text-[11px] font-normal"
            >
              {b.label}: <strong className="ml-1 font-semibold">{b.count}</strong>
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Selected chips list */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {value.slice(0, 8).map((id) => {
            const person = peopleById.get(id);
            const hasInvite =
              person?.invitations && person.invitations.length > 0;
            return (
              <button
                key={id}
                type="button"
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-muted/60",
                  hasInvite
                    ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
                    : "border-border bg-background"
                )}
                onClick={() => toggle(id)}
              >
                <span className="truncate">
                  {person
                    ? person.fullName
                    : translate("mailingLists.selectedPerson", "Selected")}
                </span>
                {hasInvite ? (
                  <span
                    title={translate("mailingLists.invitedBadge", "Invited")}
                    className="size-1.5 rounded-full bg-amber-500"
                  />
                ) : null}
                <XIcon className="size-3 shrink-0 opacity-60 hover:opacity-100" />
              </button>
            );
          })}
          {value.length > 8 ? (
            <span className="self-center text-xs text-muted-foreground">
              {translate("mailingLists.moreSelected", {
                count: value.length - 8,
              })}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
