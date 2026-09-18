import { Op, type WhereOptions } from "sequelize";

import type { ListQuery } from "@/data/types/pagination";

export function listSearchWhere(
  query: ListQuery,
  searchFields: readonly string[]
): WhereOptions | undefined {
  const parts: WhereOptions[] = [];

  if (query.q && searchFields.length > 0) {
    parts.push({
      [Op.or]: searchFields.map((field) => ({
        [field]: { [Op.like]: `%${query.q}%` },
      })),
    });
  }

  if (query.eq) {
    for (const [field, value] of Object.entries(query.eq)) {
      if (value) {
        parts.push({ [field]: value });
      }
    }
  }

  if (query.likes) {
    for (const [field, value] of Object.entries(query.likes)) {
      if (value) {
        parts.push({ [field]: { [Op.like]: `%${value}%` } });
      }
    }
  }

  if (parts.length === 0) {
    return undefined;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return { [Op.and]: parts };
}
