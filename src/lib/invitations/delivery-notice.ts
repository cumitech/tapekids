type Translate = (
  key: string,
  params?: Record<string, unknown>,
  defaultMessage?: string
) => string;

export type InvitationDeliveryResult = {
  queuedCount?: number;
  failedCount?: number;
};

export function invitationDeliveryNotice(
  result: InvitationDeliveryResult | undefined,
  mailEnabled: boolean,
  translate: Translate
): { type: "success" | "error"; message: string } {
  const queued = result?.queuedCount ?? 0;
  const failed = result?.failedCount ?? 0;

  if (!mailEnabled) {
    return {
      type: "success",
      message: translate("mailingLists.invitationsQueued", { count: queued }),
    };
  }

  if (failed > 0) {
    return {
      type: "error",
      message:
        failed >= queued && queued > 0
          ? translate("mailingLists.invitationsSendFailed")
          : translate("mailingLists.invitationsSent", {
              count: Math.max(0, queued - failed),
              failed,
            }),
    };
  }

  return {
    type: "success",
    message: translate("mailingLists.invitationsSent", {
      count: queued,
      failed: 0,
    }),
  };
}
