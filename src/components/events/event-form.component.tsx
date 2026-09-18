"use client";

import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { Controller } from "react-hook-form";

import { FormField } from "@/components/shared/form/form-field";
import { GeoFields } from "@/components/shared/form/geo-fields.component";
import { ImageUpload } from "@/components/shared/form/image-upload";
import { LocalizedTabs } from "@/components/shared/form/localized-tabs";
import { RichTextEditor } from "@/components/shared/form/rich-text-editor";
import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Input } from "@/components/shared/ui/input";
import { DEFAULT_COUNTRY } from "@/constants/geo";
import { useEventForm } from "@/hooks/events/use-event-form.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { isEmptyHtml } from "@/lib/html";

const FIELD_KEYS = [
  "title",
  "summary",
  "description",
  "venue",
  "city",
  "startsAt",
  "endsAt",
  "imageUrl",
  "isPublished",
  "requiresParticipantFee",
  "participantFeeAmount",
  "currency",
  "coordinatorFundAmount",
  "sponsorFundAmount",
] as const;

type EventFormProps = {
  mode: "create" | "edit";
  id?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function EventForm({ mode, id, onCancel, onSuccess }: EventFormProps) {
  const translate = useTranslate();
  const labels = useResourceLabels("events", FIELD_KEYS);
  const { form, onSubmit, isLoading, onCancel: cancel } = useEventForm({
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
    watch,
    setValue,
  } = form;
  const requiresParticipantFee = watch("requiresParticipantFee");
  const isPublished = watch("isPublished");
  const imageUrl = watch("imageUrl");
  const city = watch("city");
  const [region, setRegion] = useState("");

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <LocalizedTabs>
        {(locale) => (
          <>
            <FormField
              label={labels.fields.title}
              error={errors.translations?.[locale]?.title?.message}
            >
              <Input
                {...register(`translations.${locale}.title`, {
                  required: locale === "en",
                })}
              />
            </FormField>
            <FormField
              label={labels.fields.summary}
              error={errors.translations?.[locale]?.summary?.message}
            >
              <Input
                maxLength={280}
                {...register(`translations.${locale}.summary`, {
                  required: locale === "en",
                  maxLength: 280,
                })}
              />
            </FormField>
            <FormField
              label={labels.fields.description}
              error={errors.translations?.[locale]?.description?.message}
            >
              <Controller
                name={`translations.${locale}.description`}
                control={control}
                rules={{
                  validate: (value) =>
                    locale !== "en" ||
                    !isEmptyHtml(value) ||
                    labels.fields.description,
                }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>
            <FormField label={labels.fields.venue}>
              <Input
                {...register(`translations.${locale}.venue`, {
                  required: locale === "en",
                })}
              />
            </FormField>
          </>
        )}
      </LocalizedTabs>
      <FormField label={labels.fields.imageUrl} error={errors.imageUrl?.message}>
        <ImageUpload
          value={imageUrl}
          disabled={isLoading}
          onChange={(next) =>
            setValue("imageUrl", next, { shouldDirty: true, shouldValidate: true })
          }
        />
      </FormField>
      <GeoFields
        showDivisions={false}
        value={{ country: DEFAULT_COUNTRY, region, town: city }}
        onChange={(next) => {
          setRegion(next.region);
          setValue("city", next.town, { shouldValidate: true });
        }}
        labels={{
          region: translate("people.fields.region"),
          division: translate("people.fields.division"),
          subDivision: translate("people.fields.subDivision"),
          town: labels.fields.city,
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={labels.fields.startsAt}>
          <Input type="datetime-local" {...register("startsAt", { required: true })} />
        </FormField>
        <FormField label={labels.fields.endsAt}>
          <Input type="datetime-local" {...register("endsAt")} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(isPublished)}
          onCheckedChange={(checked) =>
            setValue("isPublished", checked === true)
          }
        />
        {labels.fields.isPublished}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(requiresParticipantFee)}
          onCheckedChange={(checked) =>
            setValue("requiresParticipantFee", checked === true)
          }
        />
        {labels.fields.requiresParticipantFee}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={labels.fields.participantFeeAmount}>
          <Input type="number" min={0} step={1} {...register("participantFeeAmount")} />
        </FormField>
        <FormField label={labels.fields.currency}>
          <Input {...register("currency")} />
        </FormField>
        <FormField label={labels.fields.coordinatorFundAmount}>
          <Input type="number" min={0} step={1} {...register("coordinatorFundAmount")} />
        </FormField>
        <FormField label={labels.fields.sponsorFundAmount}>
          <Input type="number" min={0} step={1} {...register("sponsorFundAmount")} />
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {labels.actions.save}
        </Button>
        <Button type="button" variant="outline" onClick={cancel} className="w-full sm:w-auto">
          {labels.actions.cancel}
        </Button>
      </div>
    </form>
  );
}
