import { getRequestContext } from "@/lib/api/request-context";

type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

function write(level: LogLevel, message: string, fields: LogFields = {}) {
  const context = getRequestContext();
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context
      ? {
          requestId: context.requestId,
          method: context.method,
          path: context.path,
          userId: context.userId,
          ip: context.ip,
        }
      : {}),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
