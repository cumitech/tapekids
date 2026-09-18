"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BaseKey, BaseRecord, HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import type { DefaultValues, FieldValues } from "react-hook-form";

export type ResourceFormMode = "create" | "edit";

type UseResourceFormParams<
  TRecord extends BaseRecord,
  TFormValues extends FieldValues,
  TPayload
> = {
  resource: string;
  mode: ResourceFormMode;
  id?: BaseKey;
  emptyValues: TFormValues;
  initialRecord?: TRecord | null;
  toFormValues: (record?: TRecord | null) => TFormValues;
  toPayload: (values: TFormValues) => TPayload;
  refetchOnMount?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function useResourceForm<
  TRecord extends BaseRecord,
  TFormValues extends FieldValues,
  TPayload
>({
  resource,
  mode,
  id,
  emptyValues,
  initialRecord,
  toFormValues,
  toPayload,
  refetchOnMount = false,
  onCancel,
  onSuccess,
}: UseResourceFormParams<TRecord, TFormValues, TPayload>) {
  const router = useRouter();
  const appliedSignature = useRef<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const seededValues = initialRecord
    ? toFormValues(initialRecord)
    : emptyValues;

  const form = useForm<TFormValues, HttpError, TFormValues>({
    shouldUnregister: false,
    refineCoreProps: {
      resource,
      action: mode,
      id,
      redirect: false,
      queryOptions: refetchOnMount
        ? {
            staleTime: 0,
            refetchOnMount: "always",
          }
        : undefined,
      onMutationSuccess: () => {
        onSuccessRef.current?.();
      },
    },
    defaultValues: seededValues as DefaultValues<TFormValues>,
  });

  const { reset } = form;
  const record = form.refineCore.query?.data?.data as TRecord | undefined;

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }
    const source = record ?? initialRecord;
    if (!source) {
      return;
    }
    const values = toFormValues(source);
    const signature = JSON.stringify(values);
    if (appliedSignature.current === signature) {
      return;
    }
    appliedSignature.current = signature;
    reset(values);
  }, [mode, record, initialRecord, reset, toFormValues]);

  const submit = (values: TFormValues) => {
    return form.refineCore.onFinish(toPayload(values) as never);
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    router.back();
  };

  const isLoading =
    form.refineCore.formLoading || form.formState.isSubmitting;

  return {
    form,
    onSubmit: submit,
    isLoading,
    onCancel: cancel,
  };
}
