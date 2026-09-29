"use client";

import { useMemo, useState } from "react";
import { useList, useTranslate } from "@refinedev/core";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
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
import { apiGet } from "@/lib/client/api";

type MailingListPeoplePickerProps = {
  category: PersonCategory | null;
  value: string[];
  onChange: (personIds: string[]) => void;
};

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => new Set(value), [value]);

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
    if (search.trim()) {
      next.push({
        field: "q",
        operator: "contains",
        value: search.trim(),
      });
    }
    return next;
  }, [category, search]);

  const { query } = useList<Person>({
    resource: "people",
    pagination: { currentPage: 1, pageSize: 100 },
    sorters: [{ field: "fullName", order: "asc" }],
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

  const people = category
    ? ((query as { result?: { data?: Person[] }; data?: { data?: Person[] } })
        .result?.data ??
      query.data?.data ??
      [])
    : [];
  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people]
  );
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

  const selectAll = async () => {
    if (!category) {
      return;
    }
    const params = new URLSearchParams();
    params.set("idsOnly", "true");
    params.set("category", category);
    if (search.trim()) {
      params.set("q", search.trim());
    }
    setBusy(true);
    try {
      const matches = await apiGet<Array<{ id: string }>>(
        `/people?${params.toString()}`
      );
      onChange(matches.map((person) => person.id));
    } finally {
      setBusy(false);
    }
  };

  const triggerLabel =
    value.length === 0
      ? translate("mailingLists.pickCampersPlaceholder", "Search and select campers")
      : value.length === 1
        ? peopleById.get(value[0])
          ? personLabel(peopleById.get(value[0]) as Person)
          : translate("mailingLists.selectedCount", { count: 1 })
        : translate("mailingLists.selectedCount", { count: value.length });

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label>{translate("mailingLists.pickCampers", "Select campers")}</Label>
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
              className={cn("truncate", value.length === 0 && "text-muted-foreground")}
            >
              {triggerLabel}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={translate(
                "mailingLists.searchCampers",
                "Search by name or email"
              )}
            />
            <CommandList>
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
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      allVisibleSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {translate("mailingLists.selectAll", "Select all")}
                </CommandItem>
                {value.length > 0 ? (
                  <CommandItem value="clear-selection" onSelect={() => onChange([])}>
                    <XIcon className="size-4" />
                    {translate("mailingLists.clearSelection", "Clear selection")}
                  </CommandItem>
                ) : null}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {people.map((person) => (
                  <CommandItem
                    key={person.id}
                    value={person.id}
                    onSelect={() => toggle(person.id)}
                  >
                    <CheckIcon
                      className={cn(
                        "size-4",
                        selected.has(person.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{personLabel(person)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.slice(0, 8).map((id) => {
            const person = peopleById.get(id);
            return (
              <button
                key={id}
                type="button"
                className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs"
                onClick={() => toggle(id)}
              >
                <span className="truncate">
                  {person
                    ? person.fullName
                    : translate("mailingLists.selectedPerson", "Selected")}
                </span>
                <XIcon className="size-3 shrink-0 opacity-60" />
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
