import {
  APP_SETTING_CATALOG,
  APP_SETTING_KEYS,
} from "@/constants/app-settings";
import { AppSettingRepository } from "@/data/repositories/app-setting.repository";
import { InvitationBatchRepository } from "@/data/repositories/invitation-batch.repository";
import { InvitationRepository } from "@/data/repositories/invitation.repository";
import { ValidationException } from "@/exceptions/validation.exception";
import { invitationService } from "@/services/invitations/invitation.service";

const appSettingRepository = new AppSettingRepository();
const invitationBatchRepository = new InvitationBatchRepository();
const invitationRepository = new InvitationRepository();

function isOpenFlag(value: unknown) {
  return value !== false && value !== 0 && value !== "0" && value !== "false";
}

export class AppSettingService {
  async page() {
    const stored = await appSettingRepository.list();
    const byKey = new Map(stored.map((row) => [row.key, row.value]));
    const known = new Set<string>(APP_SETTING_CATALOG.map((item) => item.key));
    const settings = [
      ...APP_SETTING_CATALOG.map((item) => ({
        key: item.key,
        type: item.type,
        value: byKey.get(item.key) ?? item.defaultValue,
      })),
      ...stored
        .filter((row) => !known.has(row.key))
        .map((row) => ({
          key: row.key,
          type: "text" as const,
          value: row.value,
        })),
    ];

    const batches = await invitationBatchRepository.listForSettings();
    const invitations = await invitationRepository.listForSettings();

    return {
      settings,
      batches: batches.map((batch) => ({
        id: batch.id,
        subject: batch.subject,
        kind: batch.kind,
        status: batch.status,
        linksOpen: isOpenFlag(batch.linksOpen),
        eventTitle: batch.event?.title ?? "",
      })),
      invitations: invitations.map((invitation) => ({
        id: invitation.id,
        status: invitation.status,
        email: invitation.person?.email || invitation.emailSnapshot,
        personName: invitation.person?.fullName || invitation.emailSnapshot,
        eventTitle: invitation.event?.title ?? "",
        batchSubject: invitation.batch?.subject ?? "",
        batchLinksOpen: isOpenFlag(invitation.batch?.linksOpen),
        invitationOpen: isOpenFlag(invitation.linksOpen),
        expiresAt: invitation.expiresAt
          ? new Date(invitation.expiresAt).toISOString()
          : null,
      })),
    };
  }

  async setBoolean(key: string, open: boolean) {
    const item = APP_SETTING_CATALOG.find((entry) => entry.key === key);
    if (!item || item.type !== "boolean") {
      throw new ValidationException("Unknown application setting.");
    }
    if (key === APP_SETTING_KEYS.INVITATION_LINKS_OPEN) {
      return invitationService.setLinksOpen(open);
    }
    const value = await appSettingRepository.setBoolean(key, open);
    return { key, value };
  }

  setBatchLinksOpen(id: string, open: boolean) {
    return invitationService.setBatchLinksOpen(id, open);
  }

  extendBatch(id: string) {
    return invitationService.extendBatch(id);
  }

  setInvitationLinksOpen(id: string, open: boolean) {
    return invitationService.setInvitationLinksOpen(id, open);
  }

  extendInvitation(id: string) {
    return invitationService.extendInvitation(id);
  }
}

export const appSettingService = new AppSettingService();
