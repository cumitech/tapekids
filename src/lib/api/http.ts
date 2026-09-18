import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { isNamedError } from "@/lib/api/app-error";

type Envelope<T> = {
  data: T | null;
  message: string;
  success: boolean;
  validationErrors: unknown[];
};

function envelope<T>(
  data: T,
  message: string,
  status: number,
  validationErrors: unknown[] = []
) {
  const body: Envelope<T> = {
    data,
    message,
    success: status < 400,
    validationErrors,
  };
  return NextResponse.json(body, { status });
}

export function jsonOk<T>(data: T, message = "OK", status = 200) {
  return envelope(data, message, status);
}

export function jsonList<T>(data: T[], total: number) {
  return NextResponse.json(data, {
    headers: {
      "x-total-count": String(total),
    },
  });
}

export function jsonFail(message: string, status: number, validationErrors: unknown[] = []) {
  return envelope(null, message, status, validationErrors);
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError || isNamedError(error, "ZodError")) {
    const issues = error instanceof ZodError ? error.issues : [];
    return jsonFail(
      "Validation failed",
      400,
      issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  if (isNamedError(error, "ValidationException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Validation failed",
      400,
      [{ message: error instanceof Error ? error.message : "Validation failed" }]
    );
  }

  if (isNamedError(error, "UnauthorizedException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Unauthorized",
      401
    );
  }

  if (isNamedError(error, "ForbiddenException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Forbidden",
      403
    );
  }

  if (isNamedError(error, "ConflictException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Conflict",
      409
    );
  }

  if (isNamedError(error, "NotFoundException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Not found",
      404
    );
  }

  if (isNamedError(error, "MailSendException")) {
    return jsonFail(
      error instanceof Error ? error.message : "Could not send email.",
      502
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return jsonFail(message, 500);
}
