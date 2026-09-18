import type { MailMessage } from "@/adapters/mail";
import { htmlToPlainText } from "@/lib/html";
import { mailGreeting } from "@/lib/mail/greeting";
import type { AppLocale } from "@/constants/locales";
import {
  renderTransactionalMailHtml,
  type MailCta,
  type MailDetail,
} from "@/lib/mail/layout";

export type { MailCta, MailDetail };

export function composeMail(input: {
  to: string;
  firstName?: string;
  subject: string;
  paragraphs?: string[];
  htmlBody?: string;
  cta?: MailCta;
  details?: MailDetail[];
  locale?: AppLocale;
  headerTitle?: string;
  brand?: string;
}): MailMessage {
  const locale = input.locale ?? "en";
  const greeting = mailGreeting(input.firstName);
  const headerTitle =
    input.headerTitle ||
    (locale === "fr"
      ? "Un mot de Young Foundations Cameroun"
      : "A note from Young Foundations Cameroon");
  const paragraphs = input.paragraphs?.length
    ? input.paragraphs
    : input.htmlBody
      ? [htmlToPlainText(input.htmlBody)]
      : [];
  const textParts = [
    greeting,
    "",
    ...paragraphs,
    ...(input.details ?? [])
      .filter((row) => row.value.trim())
      .flatMap((row) => [`${row.label}: ${row.value}`]),
    ...(input.cta ? ["", `${input.cta.label}: ${input.cta.url}`] : []),
  ];

  return {
    to: input.to,
    subject: input.subject,
    text: textParts.join("\n"),
    html: renderTransactionalMailHtml({
      locale,
      brand: input.brand,
      headerTitle,
      preheader: input.subject,
      greeting,
      paragraphs,
      htmlBody: input.htmlBody,
      details: input.details,
      cta: input.cta,
    }),
  };
}
