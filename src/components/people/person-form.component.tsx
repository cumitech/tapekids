"use client";

import type { FormEvent } from "react";
import { useTranslate } from "@refinedev/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  PersonFields,
  type PersonFormLayout,
} from "@/components/people/person-fields";
import { FormStepper } from "@/components/shared/form/form-stepper";
import { Button } from "@/components/shared/ui/button";
import { PERSON_FORM_STEPS } from "@/constants/person-form-steps";
import { usePersonForm } from "@/hooks/people/use-person-form.hook";
import { usePersonFormSteps } from "@/hooks/people/use-person-form-steps.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { Person } from "@/models/people/person.model";

type PersonFormProps = {
  mode: "create" | "edit";
  id?: string;
  resource?: string;
  layout?: PersonFormLayout;
  record?: Person | null;
  showCancel?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function PersonForm({
  mode,
  id,
  resource,
  layout = mode === "create" ? "identity" : "full",
  record,
  showCancel = true,
  onCancel,
  onSuccess,
}: PersonFormProps) {
  const translate = useTranslate();
  const labels = useResourceLabels("people");
  const {
    form,
    onSubmit,
    isLoading,
    onCancel: cancel,
  } = usePersonForm({
    mode,
    id,
    resource,
    record,
    onCancel,
    onSuccess,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = form;
  const stepped = layout === "full";
  const steps = usePersonFormSteps(trigger, stepped);
  const stepLabels = PERSON_FORM_STEPS.map((name) =>
    translate(`people.sections.${name}`)
  );

  const save = () => {
    void handleSubmit(onSubmit)();
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepped) {
      await handleSubmit(onSubmit)();
      return;
    }
    if (!steps.isLast) {
      await steps.goNext();
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onFormSubmit}>
      {stepped ? (
        <FormStepper
          labels={stepLabels}
          index={steps.index}
          progressLabel={translate("people.steps.progress", {
            current: steps.index + 1,
            total: steps.total,
          })}
          onSelect={(next) => {
            void steps.goTo(next);
          }}
        />
      ) : null}

      <div className="overflow-hidden">
        <PersonFields
          layout={layout}
          section={stepped ? steps.step : "all"}
          keepMounted={stepped}
          direction={steps.direction}
          register={register}
          control={control}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {stepped && !steps.isFirst ? (
          <Button type="button" variant="outline" onClick={steps.goBack}>
            <ChevronLeft />
            {translate("people.steps.back")}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap justify-end gap-2">
          {stepped && !steps.isLast ? (
            <Button type="button" onClick={() => void steps.goNext()}>
              {translate("people.steps.next")}
              <ChevronRight />
            </Button>
          ) : (
            <Button type="button" disabled={isLoading} onClick={save}>
              {labels.actions.save}
            </Button>
          )}
          {showCancel ? (
            <Button type="button" variant="outline" onClick={cancel}>
              {labels.actions.cancel}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
