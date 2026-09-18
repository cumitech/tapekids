import { AppException } from "@/exceptions/app.exception";

export class MailSendException extends AppException {
  constructor(message = "Could not send email.") {
    super(message, 502);
  }
}
