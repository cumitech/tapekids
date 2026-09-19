export const USER_ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  STAFF: "staff",
  GUEST: "guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const ROLE_VALUES = new Set<string>(Object.values(USER_ROLES));

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLE_VALUES.has(value);
}

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

function asRoleList(
  roles: readonly string[] | string | undefined
): readonly string[] | undefined {
  return typeof roles === "string" ? [roles] : roles;
}

export function isAdminRole(
  roles: readonly string[] | string | undefined
): boolean {
  const list = asRoleList(roles);
  return hasRole(list, USER_ROLES.ADMIN) || hasRole(list, USER_ROLES.SUPER_ADMIN);
}

export function isStaffOperatorRole(
  roles: readonly string[] | string | undefined
): boolean {
  const list = asRoleList(roles);
  return hasRole(list, USER_ROLES.STAFF) && !isAdminRole(list);
}

export function isStaffDashboardRole(
  roles: readonly string[] | string | undefined
): boolean {
  return isAdminRole(roles) || isStaffOperatorRole(roles);
}
