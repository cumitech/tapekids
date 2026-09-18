"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/shared/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import {
  PHONE_COUNTRIES,
  phoneCountryName,
} from "@/constants/phone";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { composePhone, parsePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
};

export function PhoneField({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  id,
}: PhoneFieldProps) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const parsed = parsePhone(value);
  const [iso, setIso] = useState(parsed.iso);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (parsed.local) {
      setIso(parsed.iso);
    }
  }, [parsed.iso, parsed.local]);

  const selected =
    PHONE_COUNTRIES.find((country) => country.iso === iso) ?? PHONE_COUNTRIES[0];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return PHONE_COUNTRIES;
    }
    return PHONE_COUNTRIES.filter((country) => {
      const name = phoneCountryName(country, locale).toLowerCase();
      return (
        name.includes(needle) ||
        country.dial.includes(needle.replace(/^\+/, "")) ||
        country.iso.toLowerCase().includes(needle)
      );
    });
  }, [locale, query]);

  const pickCountry = (nextIso: string) => {
    setIso(nextIso);
    onChange(composePhone(nextIso, parsed.local));
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-1.5">
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
              aria-required={required}
              aria-label={translate("form.countryCode", "Country code")}
              title={translate("form.countryCode", "Country code")}
              disabled={disabled}
              className="h-9 w-[5.5rem] shrink-0 justify-between px-1.5 font-normal"
            >
              <span className="truncate">+{selected.dial}</span>
              <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <Command shouldFilter={false}>
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder={translate("form.searchCountry", "Search country or code")}
              />
              <CommandList>
                <CommandEmpty>
                  {translate("form.noCountryMatch", "No matching country.")}
                </CommandEmpty>
                <CommandGroup>
                  {filtered.map((country) => (
                    <CommandItem
                      key={country.iso}
                      value={country.iso}
                      onSelect={() => pickCountry(country.iso)}
                    >
                      <CheckIcon
                        className={cn(
                          "size-4",
                          iso === country.iso ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>
                        +{country.dial} {phoneCountryName(country, locale)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          value={parsed.local}
          placeholder={translate("form.phonePlaceholder", "6XXXXXXXX")}
          onChange={(event) => onChange(composePhone(iso, event.target.value))}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
