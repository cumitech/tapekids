import { Op } from "sequelize";

import { Invitation } from "@/data/entities";

export const PERSON_LIST_ATTRIBUTES = [
  "id",
  "fullName",
  "email",
  "phone",
  "yfId",
  "gender",
  "shirtSize",
  "dateOfBirth",
  "town",
  "address",
  "region",
  "isTrophy",
  "category",
  "importedAt",
  "createdAt",
  "updatedAt",
] as const;

export const PERSON_ROSTER_ATTRIBUTES = [
  "id",
  "fullName",
  "email",
  "yfId",
] as const;

export const EVENT_LIST_ATTRIBUTES = [
  "id",
  "title",
  "slug",
  "summary",
  "venue",
  "city",
  "startsAt",
  "endsAt",
  "isPublished",
  "eventType",
  "imageUrl",
  "createdAt",
  "updatedAt",
] as const;

export const EVENT_REF_ATTRIBUTES = ["id", "title", "slug", "startsAt"] as const;

export const USER_SESSION_ATTRIBUTES = [
  "id",
  "email",
  "yfId",
  "username",
  "role",
  "verified",
  "passwordChosen",
  "sessionVersion",
  "personId",
] as const;

export const INVITATION_BATCH_LIST_ATTRIBUTES = [
  "id",
  "eventId",
  "mailingListId",
  "kind",
  "subject",
  "sentById",
  "status",
  "linksOpen",
  "sentAt",
  "createdAt",
  "updatedAt",
] as const;

export async function personIdsWithInvitations(
  personIds: string[]
): Promise<Set<string>> {
  if (personIds.length === 0) {
    return new Set();
  }

  const rows = await Invitation.findAll({
    attributes: ["personId"],
    where: { personId: { [Op.in]: personIds } },
    group: ["personId"],
    raw: true,
  });

  return new Set(
    rows.map((row) => (row as { personId: string }).personId).filter(Boolean)
  );
}

export function withInvitationFlag<T extends { id: string }>(
  person: T,
  invited: Set<string>
): T & {
  hasInvitation: boolean;
  invitations: Array<{ id: string; status: string }>;
} {
  const hasInvitation = invited.has(person.id);
  return {
    ...person,
    hasInvitation,
    invitations: hasInvitation ? [{ id: "invited", status: "sent" }] : [],
  };
}
