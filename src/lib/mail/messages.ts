import type { MailMessage } from "@/adapters/mail";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { publicAppUrl } from "@/lib/app-url";
import { formatEventRange } from "@/lib/invitations/invitation-copy";
import { composeMail } from "@/lib/mail/compose";

export function invitationAcceptUrl(token: string) {
  return publicAppUrl(`/invite/${token}`);
}

export function passwordResetUrl(token: string) {
  return publicAppUrl(`/reset-password/${token}`);
}

export function verifyEmailUrl(token: string) {
  return publicAppUrl(`/verify-email/${token}`);
}

export function loginUrl() {
  return publicAppUrl("/login");
}

export function dashboardUrl(locale?: AppLocale) {
  return publicAppUrl("/dashboard", locale);
}

export function invitationMail(input: {
  to: string;
  firstName: string;
  eventTitle: string;
  eventVenue?: string | null;
  eventCity?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  subject: string;
  body: string;
  token: string;
  locale?: AppLocale;
}): MailMessage {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const where = [input.eventVenue, input.eventCity].filter(Boolean).join(", ");
  const when = formatEventRange(input.startsAt, input.endsAt, locale);
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: input.subject,
    locale,
    headerTitle: locale === "fr" ? "Vous êtes invités" : "You are invited",
    htmlBody: input.body,
    details: [
      { label: locale === "fr" ? "Événement" : "Event", value: input.eventTitle },
      { label: locale === "fr" ? "Quand" : "When", value: when },
      { label: locale === "fr" ? "Où" : "Where", value: where },
    ],
    cta: {
      label: locale === "fr" ? "Accepter l'invitation" : "Accept invitation",
      url: invitationAcceptUrl(input.token),
    },
  });
}

export function passwordResetMail(input: {
  to: string;
  firstName?: string;
  token: string;
  setPassword?: boolean;
}): MailMessage {
  const action = input.setPassword ? "Set your password" : "Reset your password";
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: action,
    paragraphs: [
      input.setPassword
        ? "Your Young Foundations account is ready. Set a password to sign in."
        : "We received a request to reset your password.",
      "This link expires in 2 hours.",
    ],
    cta: { label: action, url: passwordResetUrl(input.token) },
  });
}

export function verifyEmailMail(input: {
  to: string;
  firstName?: string;
  token: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: "Confirm your email",
    paragraphs: [
      "Confirm this email to open your Young Foundations guest account.",
      "This link expires in 48 hours.",
    ],
    cta: { label: "Confirm email", url: verifyEmailUrl(input.token) },
  });
}

export function passwordChangedMail(input: {
  to: string;
  firstName?: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: "Your password was updated",
    paragraphs: [
      "Your password was changed successfully.",
      "If you did not do this, reset it again immediately.",
    ],
    cta: { label: "Sign in", url: loginUrl() },
  });
}

export function welcomeMail(input: {
  to: string;
  firstName?: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: "Welcome to Young Foundations Cameroon",
    paragraphs: [
      "Your guest account is ready for this Young Foundations fellowship.",
      "Complete your profile from the dashboard, then pay for camps you are invited to.",
    ],
    cta: { label: "Open dashboard", url: dashboardUrl() },
  });
}

export function registrationConfirmedMail(input: {
  to: string;
  firstName?: string;
  eventTitle: string;
  kind: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: `You are registered for ${input.eventTitle}`,
    paragraphs: [
      `Your ${input.kind} place at ${input.eventTitle} is confirmed.`,
      "We will write again if a payment is recorded, or if coordinators send another update. Place God and His Word first in all things.",
    ],
  });
}

export function paymentSucceededMail(input: {
  to: string;
  firstName?: string;
  eventTitle: string;
  amount: string;
  currency: string;
  kind: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: `Payment received for ${input.eventTitle}`,
    paragraphs: [
      `We received your ${input.kind} gift of ${input.amount} ${input.currency} for ${input.eventTitle}.`,
      "Thank you for helping this fellowship. Keep this email as your receipt.",
    ],
  });
}

export function paymentFailedMail(input: {
  to: string;
  firstName?: string;
  eventTitle: string;
  amount: string;
  currency: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: `Payment unsuccessful for ${input.eventTitle}`,
    paragraphs: [
      `The payment of ${input.amount} ${input.currency} for ${input.eventTitle} did not complete.`,
      "You can try again from your camp page, or reply if you need help.",
    ],
  });
}

export function paymentWaivedMail(input: {
  to: string;
  firstName?: string;
  eventTitle: string;
}): MailMessage {
  return composeMail({
    to: input.to,
    firstName: input.firstName,
    subject: `Payment waived for ${input.eventTitle}`,
    paragraphs: [
      `No payment is due for ${input.eventTitle}. Coordinators marked this fee as waived.`,
    ],
  });
}
