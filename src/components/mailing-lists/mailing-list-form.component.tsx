"use client";

import { useEffect, useMemo, useRef } from "react";
import { useList, useTranslate } from "@refinedev/core";
import { Controller } from "react-hook-form";

import { MailingListPeoplePicker } from "@/components/mailing-lists/mailing-list-people-picker";
import { FormField } from "@/components/shared/form/form-field";
import { LabeledCombobox } from "@/components/shared/form/labeled-combobox";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { LocalizedTabs } from "@/components/shared/form/localized-tabs";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { PERSON_CATEGORY_VALUES, categoryForAudience } from "@/constants/person";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/constants/locales";
import { useMailingListForm } from "@/hooks/mailing-lists/use-mailing-list-form.hook";
import { i18n } from "@/providers/i18n-provider/i18n";
import type { Event } from "@/models/events/event.model";
import type { MailingList } from "@/models/mailing-lists/mailing-list.model";
import type { MailingListFormValues } from "@/types/forms";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { requireAnyLocaleField } from "@/lib/content-i18n/pick";

const FIELD_KEYS = ["name", "description", "audienceKind"] as const;

type MailingListFormProps = {
  mode: "create" | "edit";
  id?: string;
  defaults?: Partial<MailingListFormValues>;
  /** Event chosen earlier in prepare-event. Create mode prefers this, then the newest event. */
  preferredEventId?: string;
  onCancel?: () => void;
  onSuccess?: (record: MailingList) => void;
};

function descriptionFromName(locale: AppLocale, name: string) {
  return i18n
    .t("mailingLists.derivedDescription", { lng: locale, name })
    .slice(0, 255);
}

export function MailingListForm({
  mode,
  id,
  defaults,
  preferredEventId,
  onCancel,
  onSuccess,
}: MailingListFormProps) {
  const translate = useTranslate();
  const labels = useResourceLabels("mailingLists", FIELD_KEYS);
  const { form, onSubmit, isLoading, onCancel: cancel } = useMailingListForm({
    mode,
    id,
    defaults,
    onCancel,
    onSuccess,
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;
  const audienceKind = watch("audienceKind");
  const audienceCategory = categoryForAudience(audienceKind);
  const { query } = useList<Event>({
    resource: "events",
    pagination: { currentPage: 1, pageSize: 100 },
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: {
      enabled: mode === "create",
      staleTime: 30_000,
    },
  });
  const events = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const eventOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ value: string; label: string }> = [];
    for (const event of events) {
      const title = event.title?.trim();
      if (!title) {
        continue;
      }
      const key = title.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      options.push({ value: title, label: title });
    }
    return options;
  }, [events]);
  const derivedDescription = useRef<Record<AppLocale, string>>({ fr: "", en: "" });
  const seeded = useRef(false);

  function writeName(locale: AppLocale, name: string) {
    const nextName = name.trim().slice(0, 128);
    if (!nextName) {
      return;
    }
    setValue(`translations.${locale}.name`, nextName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const nextDescription = descriptionFromName(locale, nextName);
    const current = getValues(`translations.${locale}.description`) ?? "";
    if (!current.trim() || current === derivedDescription.current[locale]) {
      setValue(`translations.${locale}.description`, nextDescription, {
        shouldDirty: true,
      });
      derivedDescription.current[locale] = nextDescription;
    }
  }

  function applyEvent(event: Event) {
    const title = event.title?.trim();
    if (!title) {
      return;
    }
    for (const locale of LOCALES) {
      writeName(locale, title);
    }
  }

  const applyEventRef = useRef(applyEvent);
  applyEventRef.current = applyEvent;

  useEffect(() => {
    if (mode !== "create" || seeded.current || events.length === 0) {
      return;
    }
    const alreadyNamed = LOCALES.some((locale) =>
      getValues(`translations.${locale}.name`)?.trim()
    );
    if (alreadyNamed) {
      seeded.current = true;
      return;
    }
    const preferred = preferredEventId
      ? events.find((event) => event.id === preferredEventId)
      : undefined;
    const chosen = preferred ?? events[0];
    if (!chosen) {
      return;
    }
    seeded.current = true;
    applyEventRef.current(chosen);
  }, [events, getValues, mode, preferredEventId]);

  if (mode === "create") {
    for (const locale of LOCALES) {
      register(
        `translations.${locale}.name`,
        requireAnyLocaleField(locale, "name", labels.fields.name)
      );
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <LocalizedTabs>
        {(locale: AppLocale) => (
          <>
            {mode === "create" ? (
              <LabeledCombobox
                label={labels.fields.name}
                required={locale === DEFAULT_LOCALE}
                value={watch(`translations.${locale}.name`) ?? ""}
                placeholder={translate("form.typeOrSelect")}
                error={errors.translations?.[locale]?.name?.message}
                options={eventOptions}
                onChange={(next) => {
                  const match = events.find(
                    (event) =>
                      event.title?.trim().toLowerCase() === next.trim().toLowerCase()
                  );
                  if (match) {
                    applyEvent(match);
                    return;
                  }
                  writeName(locale, next);
                }}
              />
            ) : (
              <FormField
                label={labels.fields.name}
                error={errors.translations?.[locale]?.name?.message}
                required={locale === DEFAULT_LOCALE}
              >
                <Input
                  {...register(
                    `translations.${locale}.name`,
                    requireAnyLocaleField(locale, "name", labels.fields.name)
                  )}
                />
              </FormField>
            )}
            <FormField label={labels.fields.description}>
              <Controller
                control={control}
                name={`translations.${locale}.description`}
                render={({ field }) => (
                  <Textarea
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
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
            onChange={(value) => {
              field.onChange(value);
              setValue("personIds", []);
            }}
            options={PERSON_CATEGORY_VALUES.map((kind) => ({
              value: kind,
              label: translate(`people.categories.${kind}`),
            }))}
          />
        )}
      />
      <Controller
        control={control}
        name="personIds"
        render={({ field }) => (
          <MailingListPeoplePicker
            category={audienceCategory}
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
