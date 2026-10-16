import type { CrudFilter } from "@refinedev/core";

import type { PersonCategory } from "@/constants/person";

export function matchingPeopleQuery(filters: CrudFilter[]) {
  const params = new URLSearchParams();
  params.set("idsOnly", "true");
  params.set("_start", "0");
  params.set("_end", "1");
  for (const filter of filters) {
    if (!("field" in filter)) {
      continue;
    }
    if (filter.value == null || filter.value === "") {
      continue;
    }
    const text = String(filter.value);
    if (filter.operator === "eq") {
      params.set(filter.field, text);
    } else if (filter.operator === "contains") {
      params.set(`${filter.field}_like`, text);
    }
  }
  return params;
}

export function onlyCategoryFilter(
  filters: CrudFilter[],
  category: PersonCategory
) {
  return filters.every((filter) => {
    if (!("field" in filter)) {
      return true;
    }
    if (filter.value == null || filter.value === "") {
      return true;
    }
    return filter.field === "category" && String(filter.value) === category;
  });
}
