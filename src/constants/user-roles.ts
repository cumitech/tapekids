export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  GUEST: "guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function hasRole(
  roles: readonly string[] | undefined,
  role: UserRole
): boolean {
  return Boolean(roles?.includes(role));
}

export function hasAnyRole(
  roles: readonly string[] | undefined,
  required: readonly UserRole[]
): boolean {
  return required.some((role) => hasRole(roles, role));
}
