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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { DEFAULT_COUNTRY } from "@/constants/geo";
import { EVENT_TYPES } from "@/constants/event-type";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { useEventForm } from "@/hooks/events/use-event-form.hook";
import type { Event } from "@/models/events/event.model";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { requireAnyLocaleField } from "@/lib/content-i18n/pick";
import { eventSpanError } from "@/lib/events/event-span";

const FIELD_KEYS = [
  "title",
  "summary",
  "description",
  "venue",
  "city",
  "startsAt",
  "endsAt",
  "eventType",
  "imageUrl",
  "isPublished",
  "requiresParticipantFee",
  "participantFeeAmount",
  "currency",
] as const;

type EventFormProps = {
  mode: "create" | "edit";
  id?: string;
  onCancel?: () => void;
  onSuccess?: (record: Event) => void;
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
        {(locale: AppLocale) => (
          <>
            <FormField
              label={labels.fields.title}
              error={errors.translations?.[locale]?.title?.message}
              required={locale === DEFAULT_LOCALE}
            >
              <Input
                {...register(
                  `translations.${locale}.title`,
                  requireAnyLocaleField(locale, "title", labels.fields.title)
                )}
              />
            </FormField>
            <FormField
              label={labels.fields.summary}
              error={errors.translations?.[locale]?.summary?.message}
              required={locale === DEFAULT_LOCALE}
            >
              <Input
                maxLength={280}
                {...register(`translations.${locale}.summary`, {
                  ...requireAnyLocaleField(
                    locale,
                    "summary",
                    labels.fields.summary
                  ),
                  maxLength: 280,
                })}
              />
            </FormField>
            <FormField
              label={labels.fields.description}
              error={errors.translations?.[locale]?.description?.message}
              required={locale === DEFAULT_LOCALE}
            >
              <Controller
                name={`translations.${locale}.description`}
                control={control}
                rules={requireAnyLocaleField(
                  locale,
                  "description",
                  labels.fields.description
                )}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>
            <FormField
              label={labels.fields.venue}
              required={locale === DEFAULT_LOCALE}
            >
              <Input
                {...register(
                  `translations.${locale}.venue`,
                  requireAnyLocaleField(locale, "venue", labels.fields.venue)
                )}
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
        required={{ town: true }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={labels.fields.startsAt} required>
          <Input type="datetime-local" {...register("startsAt", { required: true })} />
        </FormField>
        <FormField label={labels.fields.endsAt} error={errors.endsAt?.message} required>
          <Input
            type="datetime-local"
            {...register("endsAt", {
              validate: (value) =>
                eventSpanError(watch("eventType"), watch("startsAt"), value) ??
                true,
            })}
          />
        </FormField>
      </div>
      <Controller
        control={control}
        name="eventType"
        render={({ field }) => (
          <FormField label={labels.fields.eventType} required>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EVENT_TYPES.CAMP}>
                  {translate("events.types.camp")}
                </SelectItem>
                <SelectItem value={EVENT_TYPES.DAY_EVENT}>
                  {translate("events.types.day_event")}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
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
