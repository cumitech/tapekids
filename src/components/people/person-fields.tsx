"use client";

import {
  type Control,
  Controller,
  type FieldErrors,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useTranslate } from "@refinedev/core";

import { FormField } from "@/components/shared/form/form-field";
import { FormSection } from "@/components/shared/form/form-section";
import { GeoFields } from "@/components/shared/form/geo-fields.component";
import { PhoneField } from "@/components/shared/form/phone-field";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { Textarea } from "@/components/shared/ui/textarea";
import { PERSON_GENDERS, MAX_GUARDIANS, MIN_GUARDIANS } from "@/constants/person";
import { cn } from "@/lib/utils";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import {
  emptyGuardian,
} from "@/models/people/person.model";
import type { PersonFormStep } from "@/constants/person-form-steps";
import type { GeoSelection } from "@/types/geo";
import type { PersonFormValues } from "@/types/forms";
import type { ReactNode } from "react";

function StepBlock({
  active,
  keepMounted,
  direction,
  children,
}: {
  active: boolean;
  keepMounted: boolean;
  direction: 1 | -1;
  children: ReactNode;
}) {
  if (!active && !keepMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        !active && "hidden",
        active &&
          cn(
            "animate-in fade-in duration-400 fill-mode-both",
            direction >= 0 ? "slide-in-from-right-8" : "slide-in-from-left-8"
          )
      )}
      hidden={!active}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

export const PERSON_FIELD_KEYS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "address",
  "churchName",
  "churchPastorName",
  "churchAddress",
  "town",
  "region",
  "division",
  "subDivision",
  "parentGuardianName",
  "parentGuardianPhone",
  "medicalNotes",
] as const;

export type PersonFormLayout = "identity" | "full";

type PersonFieldsProps = {
  layout: PersonFormLayout;
  section?: PersonFormStep | "all";
  keepMounted?: boolean;
  direction?: 1 | -1;
  register: UseFormRegister<PersonFormValues>;
  control: Control<PersonFormValues>;
  errors: FieldErrors<PersonFormValues>;
  watch: UseFormWatch<PersonFormValues>;
  setValue: UseFormSetValue<PersonFormValues>;
  lockEmail?: boolean;
  identityHint?: string;
};

export function PersonFields({
  layout,
  section = "all",
  keepMounted = false,
  direction = 1,
  register,
  control,
  errors,
  watch,
  setValue,
  lockEmail = false,
  identityHint,
}: PersonFieldsProps) {
  const translate = useTranslate();
  const labels = useResourceLabels("people", PERSON_FIELD_KEYS);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardians",
  });
  const copy = {
    identity: translate("people.sections.identity", "Personal details"),
    location: translate("people.sections.location", "Location"),
    church: translate("people.sections.church", "Church"),
    guardians: translate("people.sections.guardians", "Parents / guardians"),
    notes: translate("people.sections.notes", "Medical notes"),
    guardiansHint: translate(
      "people.guardiansHint",
      "Add up to three parents or guardians. At least one row stays available.",
    ),
    addGuardian: translate("people.addGuardian", "Add guardian"),
    removeGuardian: translate("people.removeGuardian", "Remove guardian"),
    guardianNamePlaceholder: translate(
      "people.guardianNamePlaceholder",
      "Full name",
    ),
  };
  const geoValue: GeoSelection = {
    country: watch("country"),
    region: watch("region"),
    division: watch("division"),
    subDivision: watch("subDivision"),
    town: watch("town"),
  };
  const isSectionActive = (name: PersonFormStep) =>
    layout === "identity"
      ? name === "identity"
      : section === "all" || section === name;

  return (
    <>
      <StepBlock
        active={isSectionActive("identity")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.identity} description={identityHint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={labels.fields.firstName}
              error={errors.firstName?.message}
            >
              <Input {...register("firstName", { required: true })} />
            </FormField>
            <FormField
              label={labels.fields.lastName}
              error={errors.lastName?.message}
            >
              <Input {...register("lastName", { required: true })} />
            </FormField>
            <FormField
              label={labels.fields.email}
              error={errors.email?.message}
            >
              <Input
                type="email"
                readOnly={lockEmail}
                {...register("email", { required: true })}
              />
            </FormField>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <PhoneField
                  label={labels.fields.phone}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                />
              )}
            />
            {layout === "full" ? (
              <>
                <FormField label={labels.fields.dateOfBirth}>
                  <Input type="date" {...register("dateOfBirth")} />
                </FormField>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormField
                      label={labels.fields.gender}
                      error={errors.gender?.message}
                    >
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={translate(
                              "people.genderPlaceholder",
                              "Select gender",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {PERSON_GENDERS.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {translate(`people.genders.${gender}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
              </>
            ) : null}
          </div>
        </FormSection>
      </StepBlock>

      <StepBlock
        active={isSectionActive("location")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.location}>
          <GeoFields
            value={geoValue}
            onChange={(next) => {
              setValue("country", next.country);
              setValue("region", next.region);
              setValue("division", next.division);
              setValue("subDivision", next.subDivision);
              setValue("town", next.town);
            }}
            labels={{
              region: labels.fields.region,
              division: labels.fields.division,
              subDivision: labels.fields.subDivision,
              town: labels.fields.town,
            }}
          />
          <FormField label={labels.fields.address}>
            <Input {...register("address")} />
          </FormField>
        </FormSection>
      </StepBlock>

      <StepBlock
        active={isSectionActive("guardians")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.guardians} description={copy.guardiansHint}>
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[#466d6b]">
                  {translate(
                    "people.guardianRow",
                    { n: index + 1 },
                    "Guardian {{n}}",
                  )}
                </p>
                <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <FormField
                    label={labels.fields.parentGuardianName}
                    error={errors.guardians?.[index]?.name?.message}
                  >
                    <Input
                      {...register(`guardians.${index}.name` as const)}
                      placeholder={copy.guardianNamePlaceholder}
                    />
                  </FormField>
                  <Controller
                    control={control}
                    name={`guardians.${index}.phone`}
                    render={({ field: phoneField }) => (
                      <PhoneField
                        label={labels.fields.parentGuardianPhone}
                        value={phoneField.value ?? ""}
                        onChange={phoneField.onChange}
                        error={errors.guardians?.[index]?.phone?.message}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="mb-px shrink-0"
                    disabled={fields.length <= MIN_GUARDIANS}
                    aria-label={copy.removeGuardian}
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
            {fields.length < MAX_GUARDIANS ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptyGuardian())}
                >
                  <Plus />
                  {copy.addGuardian}
                </Button>
              </div>
            ) : null}
          </div>
        </FormSection>
      </StepBlock>

      <StepBlock
        active={isSectionActive("church")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.church}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={labels.fields.churchName}>
              <Input {...register("churchName")} />
            </FormField>
            <FormField label={labels.fields.churchPastorName}>
              <Input {...register("churchPastorName")} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label={labels.fields.churchAddress}>
                <Input {...register("churchAddress")} />
              </FormField>
            </div>
          </div>
        </FormSection>
      </StepBlock>

      <StepBlock
        active={isSectionActive("notes")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.notes}>
          <FormField label={labels.fields.medicalNotes}>
            <Textarea {...register("medicalNotes")} />
          </FormField>
        </FormSection>
      </StepBlock>
    </>
  );
}
