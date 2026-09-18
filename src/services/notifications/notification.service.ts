import { getMailAdapter, type MailMessage } from "@/adapters/mail";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/constants/event-participation";
import type { Event } from "@/data/entities/event";
import type { Payment } from "@/data/entities/payment";
import type { Person } from "@/data/entities/person";
import { isMailConfigured } from "@/lib/integrations/env";
import { logger } from "@/lib/logger";
import {
  invitationMail,
  passwordChangedMail,
  passwordResetMail,
  paymentFailedMail,
  paymentSucceededMail,
  paymentWaivedMail,
  registrationConfirmedMail,
  welcomeMail,
} from "@/lib/mail/messages";

export class NotificationService {
  async send(message: MailMessage): Promise<boolean> {
    if (!isMailConfigured()) {
      logger.warn("mail.skipped_not_configured", { to: message.to, subject: message.subject });
      return false;
    }

    try {
      await getMailAdapter().send(message);
      logger.info("mail.sent", { to: message.to, subject: message.subject });
      return true;
    } catch (error) {
      logger.error("mail.send_failed", {
        to: message.to,
        subject: message.subject,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async sendQuiet(message: MailMessage): Promise<boolean> {
    try {
      return await this.send(message);
    } catch {
      return false;
    }
  }

  invitation(input: Parameters<typeof invitationMail>[0]) {
    return this.send(invitationMail(input));
  }

  passwordReset(input: Parameters<typeof passwordResetMail>[0]) {
    return this.send(passwordResetMail(input));
  }

  passwordChanged(input: { to: string; firstName?: string }) {
    return this.sendQuiet(passwordChangedMail(input));
  }

  welcome(input: { to: string; firstName?: string }) {
    return this.sendQuiet(welcomeMail(input));
  }

  registrationConfirmed(input: {
    to: string;
    firstName?: string;
    eventTitle: string;
    kind: string;
  }) {
    return this.sendQuiet(registrationConfirmedMail(input));
  }

  async paymentStatusChanged(input: {
    previousStatus: PaymentStatus;
    payment: Payment;
    person?: Person | null;
    event?: Event | null;
  }) {
    if (input.previousStatus === input.payment.status) {
      return false;
    }

    const to = input.person?.email;
    if (!to) {
      logger.warn("mail.payment_skipped_no_email", { paymentId: input.payment.id });
      return false;
    }

    const firstName = input.person?.firstName;
    const eventTitle = input.event?.title ?? "the event";
    const amount = String(input.payment.amount);
    const currency = input.payment.currency;
    const kind = input.payment.kind.replace(/_/g, " ");

    if (input.payment.status === PAYMENT_STATUSES.PAID) {
      return this.sendQuiet(
        paymentSucceededMail({
          to,
          firstName,
          eventTitle,
          amount,
          currency,
          kind,
        })
      );
    }
    if (input.payment.status === PAYMENT_STATUSES.FAILED) {
      return this.sendQuiet(
        paymentFailedMail({
          to,
          firstName,
          eventTitle,
          amount,
          currency,
        })
      );
    }
    if (input.payment.status === PAYMENT_STATUSES.WAIVED) {
      return this.sendQuiet(
        paymentWaivedMail({ to, firstName, eventTitle })
      );
    }
    return false;
  }
}

export const notificationService = new NotificationService();
