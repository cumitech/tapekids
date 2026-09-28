"use client";

import { useTranslate } from "@refinedev/core";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import {
  PERSON_CATEGORY_VALUES,
  type PersonCategory,
} from "@/constants/person";

type PersonCategorySelectProps = {
  value?: string | null;
  onChange: (value: PersonCategory) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export function PersonCategorySelect({
  value,
  onChange,
  placeholder,
  disabled,
  id,
}: PersonCategorySelectProps) {
  const translate = useTranslate();

  return (
    <Select
      value={value || undefined}
      onValueChange={(next) => onChange(next as PersonCategory)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue
          placeholder={
            placeholder ?? translate("people.import.chooseCategory")
          }
        />
      </SelectTrigger>
      <SelectContent>
        {PERSON_CATEGORY_VALUES.map((item) => (
          <SelectItem key={item} value={item}>
            {translate(`people.categories.${item}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
