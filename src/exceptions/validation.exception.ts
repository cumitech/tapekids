import { AppException } from "@/exceptions/app.exception";

export class ValidationException extends AppException {
  constructor(message: string) {
    super(message);
  }
}
