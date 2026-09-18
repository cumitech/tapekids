"use client";

import { useCallback, type ReactNode } from "react";
import type { BaseKey } from "@refinedev/core";
import { useTranslate } from "@refinedev/core";

import { useAppModal } from "@/components/shared/modals/app-modal";

export function useDashboardFormModal() {
  const { openModal, closeModal } = useAppModal();
  const translate = useTranslate();

  const openForm = useCallback(
    ({
      i18nKey,
      mode,
      className,
      render,
    }: {
      i18nKey: string;
      mode: "create" | "edit";
      className?: string;
      render: (helpers: { close: () => void }) => ReactNode;
    }) => {
      openModal({
        title: translate(`${i18nKey}.titles.${mode}`),
        className,
        body: render({ close: closeModal }),
      });
    },
    [closeModal, openModal, translate]
  );

  const openCreate = useCallback(
    (
      i18nKey: string,
      render: (helpers: { close: () => void }) => ReactNode,
      className?: string
    ) => openForm({ i18nKey, mode: "create", className, render }),
    [openForm]
  );

  const openEdit = useCallback(
    (
      i18nKey: string,
      _id: BaseKey,
      render: (helpers: { close: () => void }) => ReactNode,
      className?: string
    ) => openForm({ i18nKey, mode: "edit", className, render }),
    [openForm]
  );

  return { openForm, openCreate, openEdit, closeModal };
}
