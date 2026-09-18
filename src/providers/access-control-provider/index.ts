import type { AccessControlProvider } from "@refinedev/core";

import { canPerform, rolesFromUnknown } from "@/lib/permissions";
import { getSession } from "@/utils/auth-storage";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const session = getSession();
    const roles = rolesFromUnknown(session?.user.roles);
    return {
      can: canPerform({
        roles,
        resource: resource ?? "",
        action,
      }),
    };
  },
};
