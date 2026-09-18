"use client";

import { useTranslate } from "@refinedev/core";
import { Controller } from "react-hook-form";

import { MailingListPeoplePicker } from "@/components/mailing-lists/mailing-list-people-picker";
import { FormField } from "@/components/shared/form/form-field";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { LocalizedTabs } from "@/components/shared/form/localized-tabs";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";
import { useMailingListForm } from "@/hooks/mailing-lists/use-mailing-list-form.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

const FIELD_KEYS = ["name", "description", "audienceKind"] as const;

type MailingListFormProps = {
  mode: "create" | "edit";
  id?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function MailingListForm({
  mode,
  id,
  onCancel,
  onSuccess,
}: MailingListFormProps) {
  const translate = useTranslate();
  const labels = useResourceLabels("mailingLists", FIELD_KEYS);
  const { form, onSubmit, isLoading, onCancel: cancel } = useMailingListForm({
    mode,
    id,
    onCancel,
    onSuccess,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <LocalizedTabs>
        {(locale) => (
          <>
            <FormField
              label={labels.fields.name}
              error={errors.translations?.[locale]?.name?.message}
            >
              <Input
                {...register(`translations.${locale}.name`, {
                  required: locale === "en",
                })}
              />
            </FormField>
            <FormField label={labels.fields.description}>
              <Textarea {...register(`translations.${locale}.description`)} />
            </FormField>
          </>
        )}
      </LocalizedTabs>
      <Controller
        control={control}
        name="audienceKind"
        render={({ field }) => (
          <LabeledSelect
            label={labels.fields.audienceKind}
            value={field.value}
            onChange={field.onChange}
            options={Object.values(MAILING_LIST_AUDIENCE_KINDS).map((kind) => ({
              value: kind,
              label: translate(`mailingLists.audienceKinds.${kind}`, kind),
            }))}
          />
        )}
      />
      <Controller
        control={control}
        name="personIds"
        render={({ field }) => (
          <MailingListPeoplePicker
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {labels.actions.save}
        </Button>
        <Button type="button" variant="outline" onClick={cancel}>
          {labels.actions.cancel}
        </Button>
      </div>
    </form>
  );
}
