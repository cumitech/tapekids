export class AppException extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
