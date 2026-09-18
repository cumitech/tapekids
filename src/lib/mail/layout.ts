import { APP_NAME } from "@/constants/brand";
import { escapeHtml } from "@/lib/mail/html";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { AppLocale } from "@/constants/locales";

export type MailCta = {
  label: string;
  url: string;
};

export type MailDetail = {
  label: string;
  value: string;
};

export type TransactionalMailLayout = {
  locale?: AppLocale;
  brand?: string;
  headerTitle: string;
  preheader?: string;
  greeting: string;
  paragraphs?: string[];
  htmlBody?: string;
  details?: MailDetail[];
  cta?: MailCta;
  footer?: string;
};

const NAVY = "#182356";
const SAGE = "#466d6b";
const MINT = "#e1edef";
const PAGE = "#e8eeed";
const INK = "#1c2434";
const MUTED = "#5b6770";

function paragraphHtml(paragraph: string) {
  const withBreaks = escapeHtml(paragraph).replace(/\r\n|\n|\r/g, "<br />");
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK};">${withBreaks}</p>`;
}

function richBodyHtml(html: string) {
  const clean = sanitizeRichText(html);
  return `<div class="yf-rich" style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK};">${clean}</div>`;
}

export function renderTransactionalMailHtml(input: TransactionalMailLayout): string {
  const brand = escapeHtml(input.brand || APP_NAME);
  const headerTitle = escapeHtml(input.headerTitle);
  const greeting = escapeHtml(input.greeting);
  const preheader = escapeHtml(input.preheader || "");
  const footer = escapeHtml(
    input.footer ||
      (input.locale === "fr"
        ? `${APP_NAME}. Young Foundations, Creations et Cub Corner. Placez Dieu et Sa Parole en premier.`
        : `${APP_NAME}. Young Foundations, Creations, and Cub Corner. Place God and His Word first.`)
  );
  const details = (input.details ?? []).filter((row) => row.value.trim());
  const detailsHtml =
    details.length === 0
      ? ""
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;background:${MINT};border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            ${details
              .map(
                (row) => `<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:${INK};">
                  <strong style="display:block;color:${SAGE};text-transform:uppercase;letter-spacing:0.06em;font-size:11px;">${escapeHtml(row.label)}</strong>
                  ${escapeHtml(row.value)}
                </p>`
              )
              .join("")}
          </td></tr>
        </table>`;
  const ctaHtml = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
        <tr>
          <td style="border-radius:10px;background:${SAGE};">
            <a href="${escapeHtml(input.cta.url)}" style="display:inline-block;padding:12px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.01em;">
              ${escapeHtml(input.cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const contentHtml = input.htmlBody
    ? richBodyHtml(input.htmlBody)
    : (input.paragraphs ?? []).map(paragraphHtml).join("");

  return `<!DOCTYPE html>
<html lang="${input.locale === "fr" ? "fr" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${headerTitle}</title>
  <style>
    .yf-rich p { margin: 0 0 12px; }
    .yf-rich h2, .yf-rich h3 { margin: 0 0 10px; font-size: 18px; line-height: 1.3; }
    .yf-rich ul, .yf-rich ol { margin: 0 0 12px; padding-left: 22px; }
    .yf-rich li { margin: 0 0 6px; }
    .yf-rich strong, .yf-rich b { font-weight: 700; }
    .yf-rich em, .yf-rich i { font-style: italic; }
    .yf-rich u { text-decoration: underline; }
    .yf-rich blockquote { margin: 0 0 12px; padding-left: 14px; border-left: 3px solid ${SAGE}; font-style: italic; }
    .yf-rich a { color: ${NAVY}; }
  </style>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(24,35,86,0.12);">
          <tr>
            <td style="background:${NAVY};padding:28px 32px;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${MINT};">${brand}</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;">${headerTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${INK};">${greeting}</p>
              ${contentHtml}
              ${detailsHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;padding-top:16px;border-top:1px solid ${MINT};font-size:12px;line-height:1.5;color:${MUTED};">${footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
