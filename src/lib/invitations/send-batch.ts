import { apiPost } from "@/lib/client/api";
import type { InvitationDeliveryResult } from "@/lib/invitations/delivery-notice";

export function sendInvitationBatch(batchId: string) {
  return apiPost<InvitationDeliveryResult>(
    `/invitation-batches/${batchId}/send`
  );
}
