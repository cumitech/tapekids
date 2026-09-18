import { AppException } from "@/exceptions/app.exception";

export class NotFoundException extends AppException {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found!`, 404);
  }
}
