export type SortOrder = "ASC" | "DESC";

export const PERSON_EQ_FILTERS = [
  "country",
  "region",
  "division",
  "subDivision",
  "town",
  "churchName",
] as const;

export const EQ_FILTER_FIELDS = [
  ...PERSON_EQ_FILTERS,
  "city",
  "venue",
  "audienceKind",
  "action",
  "entity",
] as const;

export type EqFilterKey = (typeof EQ_FILTER_FIELDS)[number];
export type PersonEqFilterKey = (typeof PERSON_EQ_FILTERS)[number];

export type ListQuery = {
  offset: number;
  limit: number;
  sort: string;
  order: SortOrder;
  q?: string;
  eq?: Partial<Record<EqFilterKey, string>>;
  likes?: Partial<Record<EqFilterKey, string>>;
  idsOnly?: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  offset: number;
  limit: number;
};

const ALLOWED_SORT = new Set([
  "createdAt",
  "updatedAt",
  "title",
  "startsAt",
  "lastName",
  "email",
  "name",
  "sentAt",
  "action",
  "entity",
]);

export function parseListQuery(searchParams: URLSearchParams): ListQuery {
  const start = Math.max(0, Number(searchParams.get("_start") ?? 0) || 0);
  const rawEnd = Number(searchParams.get("_end"));
  const end = Number.isFinite(rawEnd) ? rawEnd : start + 10;
  const limit = Math.max(1, Math.min(100, end - start || 10));
  const sortParam = searchParams.get("_sort") ?? "createdAt";
  const sort = ALLOWED_SORT.has(sortParam) ? sortParam : "createdAt";
  const order: SortOrder = searchParams.get("_order")?.toLowerCase() === "asc" ? "ASC" : "DESC";
  const likeQ =
    searchParams.get("q")?.trim() ||
    searchParams.get("q_like")?.trim() ||
    searchParams.get("email_like")?.trim() ||
    searchParams.get("firstName_like")?.trim() ||
    searchParams.get("lastName_like")?.trim() ||
    searchParams.get("phone_like")?.trim() ||
    searchParams.get("name_like")?.trim() ||
    undefined;

  const eq: ListQuery["eq"] = {};
  const likes: ListQuery["likes"] = {};
  for (const key of EQ_FILTER_FIELDS) {
    const exact = searchParams.get(key)?.trim();
    const like = searchParams.get(`${key}_like`)?.trim();
    if (exact) {
      eq[key] = exact;
    } else if (like) {
      likes[key] = like;
    }
  }

  return {
    offset: start,
    limit,
    sort,
    order,
    q: likeQ,
    eq: Object.keys(eq).length ? eq : undefined,
    likes: Object.keys(likes).length ? likes : undefined,
    idsOnly: searchParams.get("idsOnly") === "true",
  };
}
