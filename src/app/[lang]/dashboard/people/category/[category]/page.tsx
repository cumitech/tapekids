"use client";

import { useParams } from "next/navigation";

import { PeopleCategoryPage } from "@/views/people/people-category.page";

export default function Page() {
  const params = useParams();
  const raw = params?.category;
  const category = Array.isArray(raw) ? raw[0] : raw;
  return <PeopleCategoryPage category={category ?? ""} />;
}
