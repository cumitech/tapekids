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
import { PersonCategorySelect } from "@/components/people/person-category-select";
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
import { Textarea } from "@/components/shared/ui/textarea";
import { PERSON_GENDERS, SHIRT_SIZES, MAX_GUARDIANS, MIN_GUARDIANS } from "@/constants/person";
import { ageInYears } from "@/lib/people/age";
import {
  PROFILE_GEO_FIELDS,
  requiredIfComplete,
} from "@/lib/people/profile-completeness";
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
  "fullName",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "shirtSize",
  "category",
  "yfId",
  "points",
  "ageYears",
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
  requireComplete?: boolean;
  emailRequired?: boolean;
  showDirectoryFields?: boolean;
  showAge?: boolean;
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
  requireComplete = false,
  emailRequired = false,
  showDirectoryFields = true,
  showAge = false,
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
  const ageYears = ageInYears(watch("dateOfBirth"));
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
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={labels.fields.fullName}
              error={errors.fullName?.message}
              required
            >
              <Input {...register("fullName", { required: true })} />
            </FormField>
            <Controller
              control={control}
              name="phone"
              rules={requiredIfComplete(requireComplete)}
              render={({ field }) => (
                <PhoneField
                  label={labels.fields.phone}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  required={requireComplete}
                />
              )}
            />
            {showDirectoryFields ? (
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <FormField
                    label={labels.fields.category}
                    error={errors.category?.message}
                  >
                    <PersonCategorySelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormField>
                )}
              />
            ) : null}
            <FormField
              label={labels.fields.email}
              error={errors.email?.message}
              required={emailRequired || requireComplete}
            >
              <Input
                type="email"
                readOnly={lockEmail}
                {...register(
                  "email",
                  emailRequired || requireComplete ? { required: true } : {}
                )}
              />
            </FormField>
            {layout === "full" ? (
              <div
                className={cn(
                  "grid grid-cols-1 gap-4 sm:col-span-2",
                  showAge ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3",
                )}
              >
                <FormField
                  label={labels.fields.dateOfBirth}
                  required={requireComplete}
                >
                  <Input
                    type="date"
                    {...register("dateOfBirth", requiredIfComplete(requireComplete))}
                  />
                </FormField>
                <Controller
                  control={control}
                  name="gender"
                  rules={requiredIfComplete(requireComplete)}
                  render={({ field }) => (
                    <FormField
                      label={labels.fields.gender}
                      error={errors.gender?.message}
                      required={requireComplete}
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
                <Controller
                  control={control}
                  name="shirtSize"
                  rules={requiredIfComplete(requireComplete)}
                  render={({ field }) => (
                    <FormField
                      label={labels.fields.shirtSize}
                      error={errors.shirtSize?.message}
                      required={requireComplete}
                    >
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={translate(
                              "people.shirtSizePlaceholder",
                              "Select shirt size",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIRT_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {translate(`people.shirtSizes.${size}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
                {showAge ? (
                  <FormField label={labels.fields.ageYears}>
                    <Input
                      value={ageYears ?? ""}
                      readOnly
                      disabled
                      aria-readonly
                      className="cursor-default bg-muted text-foreground disabled:opacity-100"
                    />
                  </FormField>
                ) : null}
              </div>
            ) : null}
            {showDirectoryFields ? (
              <>
                <FormField label={labels.fields.yfId} error={errors.yfId?.message}>
                  <Input {...register("yfId")} />
                </FormField>
                <FormField label={labels.fields.points} error={errors.points?.message}>
                  <Input type="number" min={0} step={1} {...register("points")} />
                </FormField>
                <FormField label={labels.fields.ageYears}>
                  <Input
                    value={ageYears ?? ""}
                    readOnly
                    disabled
                    aria-readonly
                    className="cursor-default bg-muted text-foreground disabled:opacity-100"
                  />
                </FormField>
                <Controller
                  control={control}
                  name="isTrophy"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      {labels.fields.isTrophy}
                    </label>
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
              (Object.keys(next) as Array<keyof typeof next>).forEach((key) => {
                setValue(key, next[key], { shouldValidate: requireComplete });
              });
            }}
            labels={{
              region: labels.fields.region,
              division: labels.fields.division,
              subDivision: labels.fields.subDivision,
              town: labels.fields.town,
            }}
            required={
              requireComplete
                ? {
                    region: true,
                    division: true,
                    subDivision: true,
                    town: true,
                  }
                : undefined
            }
          />
          {requireComplete
            ? PROFILE_GEO_FIELDS.map((name) => (
                <input
                  key={name}
                  type="hidden"
                  {...register(name, requiredIfComplete(true))}
                />
              ))
            : null}
          <FormField
            label={labels.fields.address}
            error={errors.address?.message}
            required={requireComplete}
          >
            <Input {...register("address", requiredIfComplete(requireComplete))} />
          </FormField>
        </FormSection>
      </StepBlock>

      <StepBlock
        active={isSectionActive("guardians")}
        keepMounted={keepMounted}
        direction={direction}
      >
        <FormSection title={copy.guardians}>
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-secondary">
                  {translate(
                    "people.guardianRow",
                    { n: index + 1 },
                    "Guardian {{n}}",
                  )}
                </p>
                <div className="grid min-w-0 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <FormField
                    label={labels.fields.parentGuardianName}
                    error={errors.guardians?.[index]?.name?.message}
                    required={requireComplete && index === 0}
                  >
                    <Input
                      {...register(`guardians.${index}.name` as const, {
                        ...requiredIfComplete(requireComplete && index === 0),
                      })}
                      placeholder={copy.guardianNamePlaceholder}
                    />
                  </FormField>
                  <Controller
                    control={control}
                    name={`guardians.${index}.phone`}
                    rules={requiredIfComplete(requireComplete && index === 0)}
                    render={({ field: phoneField }) => (
                      <PhoneField
                        label={labels.fields.parentGuardianPhone}
                        value={phoneField.value ?? ""}
                        onChange={phoneField.onChange}
                        error={errors.guardians?.[index]?.phone?.message}
                        required={requireComplete && index === 0}
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
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField
              label={labels.fields.churchName}
              error={errors.churchName?.message}
              required={requireComplete}
            >
              <Input {...register("churchName", requiredIfComplete(requireComplete))} />
            </FormField>
            <FormField
              label={labels.fields.churchPastorName}
              error={errors.churchPastorName?.message}
              required={requireComplete}
            >
              <Input
                {...register("churchPastorName", requiredIfComplete(requireComplete))}
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField
                label={labels.fields.churchAddress}
                error={errors.churchAddress?.message}
                required={requireComplete}
              >
                <Input
                  {...register("churchAddress", requiredIfComplete(requireComplete))}
                />
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
