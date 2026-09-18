"use client";

import { useMemo, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/shared/form/labeled-select";

type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export function LabeledCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: LabeledComboboxProps) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return options;
    }
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle)
    );
  }, [options, query]);

  const canUseCustom =
    query.trim().length > 0 &&
    !options.some(
      (option) => option.value.toLowerCase() === query.trim().toLowerCase()
    );

  const commit = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      return;
    }
    onChange(trimmed);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label>{label}</Label>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="h-9 w-full justify-between font-normal"
          >
            <span
              className={cn(
                "truncate",
                !value && "text-muted-foreground"
              )}
            >
              {value || placeholder || translate("form.typeOrSelect")}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={translate("form.typeOrSelect")}
              onKeyDown={(event) => {
                if (event.key === "Enter" && query.trim()) {
                  event.preventDefault();
                  commit(query);
                }
              }}
            />
            <CommandList>
              <CommandEmpty>{translate("form.noMatchType")}</CommandEmpty>
              {filtered.length > 0 ? (
                <CommandGroup>
                  {filtered.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => commit(option.value)}
                    >
                      <CheckIcon
                        className={cn(
                          "size-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {canUseCustom ? (
                <CommandGroup>
                  <CommandItem value={`custom-${query}`} onSelect={() => commit(query)}>
                    {translate("form.useCustom", { value: query.trim() })}
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
