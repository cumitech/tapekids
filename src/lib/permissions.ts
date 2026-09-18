import { hasRole, USER_ROLES, type UserRole } from "@/constants/user-roles";

export type PermissionAction = "list" | "create" | "edit" | "show" | "delete";

type CanPerformParams = {
  roles: readonly string[] | undefined;
  resource: string;
  action: string;
};

/** Sensitive history and system review. Admin only. */
export const ADMIN_ONLY_RESOURCES = new Set(["audit-logs"]);

/** Operational directory work. Staff and admin CRUD. */
export const STAFF_DASHBOARD_RESOURCES = new Set([
  "dashboard",
  "people",
  "mailing-lists",
  "events",
  "invitation-batches",
]);

/** Participant portal. Guests only, plus a shared dashboard home. */
export const GUEST_DASHBOARD_RESOURCES = new Set([
  "dashboard",
  "camp",
  "sponsorships",
  "profile",
  "me",
]);

const OWN_ACCOUNT_RESOURCES = new Set(["profile", "me"]);
const GUEST_PORTAL_RESOURCES = new Set(["camp", "sponsorships"]);

export function isParticipantRole(roles: readonly string[] | undefined) {
  return hasRole(roles, USER_ROLES.GUEST);
}

export function canPerform({
  roles,
  resource,
  action,
}: CanPerformParams): boolean {
  const normalizedRoles = rolesFromUnknown(roles);
  if (!normalizedRoles.length || !resource) {
    return false;
  }

  if (ADMIN_ONLY_RESOURCES.has(resource)) {
    return hasRole(normalizedRoles, USER_ROLES.ADMIN);
  }

  if (OWN_ACCOUNT_RESOURCES.has(resource)) {
    return action === "list" || action === "show" || action === "edit";
  }

  if (hasRole(normalizedRoles, USER_ROLES.ADMIN)) {
    return !GUEST_PORTAL_RESOURCES.has(resource);
  }

  if (hasRole(normalizedRoles, USER_ROLES.STAFF)) {
    return STAFF_DASHBOARD_RESOURCES.has(resource);
  }

  if (hasRole(normalizedRoles, USER_ROLES.GUEST)) {
    if (!GUEST_DASHBOARD_RESOURCES.has(resource)) {
      return false;
    }
    return action === "list" || action === "show" || action === "edit";
  }

  return false;
}

export function rolesFromUnknown(value: unknown): UserRole[] {
  if (typeof value === "string") {
    return value === USER_ROLES.ADMIN ||
      value === USER_ROLES.STAFF ||
      value === USER_ROLES.GUEST
      ? [value]
      : [];
  }
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (role): role is UserRole =>
      role === USER_ROLES.ADMIN ||
      role === USER_ROLES.STAFF ||
      role === USER_ROLES.GUEST
  );
}
