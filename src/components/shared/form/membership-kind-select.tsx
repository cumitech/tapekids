"use client";

import { useTranslate } from "@refinedev/core";

import { LabeledSelect } from "@/components/shared/form/labeled-select";
import {
  EVENT_MEMBERSHIP_KINDS,
  type EventMembershipKind,
} from "@/constants/event-participation";

type MembershipKindSelectProps = {
  label: string;
  value: EventMembershipKind;
  onChange: (value: EventMembershipKind) => void;
};

export function MembershipKindSelect({
  label,
  value,
  onChange,
}: MembershipKindSelectProps) {
  const translate = useTranslate();

  return (
    <LabeledSelect
      label={label}
      value={value}
      onChange={(next) => onChange(next as EventMembershipKind)}
      options={Object.values(EVENT_MEMBERSHIP_KINDS).map((kind) => ({
        value: kind,
        label: translate(`payments.kinds.${kind}`, kind),
      }))}
    />
  );
}
