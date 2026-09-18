import { AppException } from "@/exceptions/app.exception";

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, 409);
  }
}
