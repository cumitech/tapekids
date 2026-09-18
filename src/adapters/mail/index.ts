import { isMailConfigured } from "@/lib/integrations/env";
import { MailgunAdapter } from "./mailgun.adapter";
import type { MailAdapter } from "./types";

let adapter: MailAdapter | null = null;

export function getMailAdapter(): MailAdapter {
  if (!isMailConfigured()) {
    throw new Error("Mail is not configured.");
  }
  if (!adapter) {
    adapter = new MailgunAdapter();
  }
  return adapter;
}

export type { MailAdapter, MailMessage } from "./types";
