import { AppException } from "@/exceptions/app.exception";

export class UnauthorizedException extends AppException {
  constructor(message = "Please log in to access this resource.") {
    super(message, 401);
  }
}
