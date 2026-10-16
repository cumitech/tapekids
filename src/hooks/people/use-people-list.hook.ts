"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { PERSON_CATEGORY_VALUES, type PersonCategory } from "@/constants/person";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet } from "@/lib/client/api";

export type CategorySummary = {
  category: PersonCategory;
  count: number;
};

export type PreviewPerson = {
  id: string;
  fullName?: string | null;
  yfId?: string | null;
  email?: string | null;
};

const PREVIEW_LIMIT = 8;

export function usePeopleListPage() {
  const translate = useTranslate();
  const { openCreate } = useDashboardFormModal();
  const { path } = useLocale();
  const router = useRouter();
  const [rows, setRows] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<PersonCategory>>(
    () => new Set()
  );
  const [summaryVersion, setSummaryVersion] = useState(0);
  const translateRef = useRef(translate);
  translateRef.current = translate;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<CategorySummary[]>("/people/summary")
      .then((result) => {
        if (!cancelled) {
          setRows(result);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            apiErrorMessage(err, translateRef.current("people.summary.failed"))
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [summaryVersion]);

  function toggleCategory(category: PersonCategory) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const summaries =
    rows.length > 0
      ? rows
      : error
        ? []
        : PERSON_CATEGORY_VALUES.map((category) => ({ category, count: 0 }));

  return {
    translate,
    path,
    router,
    loading,
    error,
    summaries,
    openCategories,
    toggleCategory,
    openCreate,
    reloadSummary: () => setSummaryVersion((version) => version + 1),
  };
}

export function useCategoryPeoplePreview(
  category: PersonCategory,
  count: number
) {
  const translate = useTranslate();
  const translateRef = useRef(translate);
  translateRef.current = translate;
  const [people, setPeople] = useState<PreviewPerson[] | null>(
    count === 0 ? [] : null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (count === 0) {
      setPeople([]);
      return;
    }
    let cancelled = false;
    setPeople(null);
    setError("");
    const params = new URLSearchParams({
      category,
      _start: "0",
      _end: String(PREVIEW_LIMIT),
      _sort: "fullName",
      _order: "asc",
    });
    apiGet<PreviewPerson[]>(`/people?${params.toString()}`)
      .then((result) => {
        if (!cancelled) {
          setPeople(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            apiErrorMessage(err, translateRef.current("people.summary.failed"))
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category, count]);

  return { translate, people, error };
}
