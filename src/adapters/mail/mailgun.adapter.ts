import { MailSendException } from "@/exceptions/mail-send.exception";
import { mailgunConfig } from "@/lib/integrations/env";
import { logger } from "@/lib/logger";
import type { MailAdapter, MailMessage } from "./types";

type WorkingEndpoint = {
  origin: string;
  apiKey: string;
};

let working: WorkingEndpoint | null = null;

function isUnauthorizedStatus(status: number) {
  return status === 401 || status === 403;
}

function basicAuth(apiKey: string) {
  return `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`;
}

async function postMessage(
  origin: string,
  domain: string,
  apiKey: string,
  from: string,
  message: MailMessage
) {
  const body = new FormData();
  body.set("from", from);
  body.set("to", message.to);
  body.set("subject", message.subject);
  body.set("text", message.text);
  body.set("html", message.html);

  const response = await fetch(`${origin}/v3/${encodeURIComponent(domain)}/messages`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(apiKey),
    },
    body,
  });

  const text = await response.text();
  let details = text.slice(0, 300);
  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed.message) {
      details = parsed.message;
    }
  } catch {
    // Keep the raw snippet when Mailgun does not return JSON.
  }

  return { status: response.status, ok: response.ok, details };
}

export class MailgunAdapter implements MailAdapter {
  async send(message: MailMessage): Promise<void> {
    const config = mailgunConfig();
    if (!config.apiKeys.length || !config.domain) {
      throw new MailSendException("Mailgun is not configured.");
    }

    const fromAddress = config.from || `noreply@${config.domain}`;
    const from = `${config.fromName} <${fromAddress}>`;
    const combos: WorkingEndpoint[] = config.origins.flatMap((origin) =>
      config.apiKeys.map((apiKey) => ({ origin, apiKey }))
    );
    const preferred = working;
    const attempts = preferred
      ? [
          preferred,
          ...combos.filter(
            (item) =>
              item.origin !== preferred.origin || item.apiKey !== preferred.apiKey
          ),
        ]
      : combos;

    let lastStatus = 0;
    let lastDetails = "Mailgun request failed.";

    for (const attempt of attempts) {
      const result = await postMessage(
        attempt.origin,
        config.domain,
        attempt.apiKey,
        from,
        message
      );
      if (result.ok) {
        working = attempt;
        if (attempt.origin !== config.preferredOrigin) {
          logger.warn("mail.mailgun_used_fallback_region", {
            origin: attempt.origin,
          });
        }
        return;
      }

      lastStatus = result.status;
      lastDetails = result.details;
      logger.warn("mail.mailgun_rejected", {
        status: result.status,
        origin: attempt.origin,
        details: result.details,
      });

      if (working && isUnauthorizedStatus(result.status)) {
        working = null;
      }
      if (!isUnauthorizedStatus(result.status) && result.status < 500) {
        break;
      }
    }

    throw new MailSendException(
      lastStatus === 401
        ? "Mailgun rejected the API key or region. Use the private API key and the EU or US base URL that matches the domain."
        : lastDetails || "Could not send email."
    );
  }
}
