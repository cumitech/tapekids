import type { User } from "@/data/entities/user";
import { ensureDb } from "@/database/db-sequelize.config";
import { toErrorResponse } from "@/lib/api/http";
import { localeFromRequest } from "@/lib/api/request-locale";
import {
  clientIp,
  newRequestId,
  requestPath,
  runWithRequestContext,
} from "@/lib/api/request-context";
import { requireAdmin, requireStaffOrAdmin, requireUser } from "@/lib/api/session";
import { isClientError } from "@/lib/api/app-error";
import { logger } from "@/lib/logger";

type Params = Record<string, string>;
type RouteContext<P extends Params> = { params: Promise<P> };

export type PublicRouteArgs<P extends Params> = {
  request: Request;
  params: P;
};

export type AuthedRouteArgs<P extends Params> = PublicRouteArgs<P> & {
  user: User;
};

function emptyParams<P extends Params>(): P {
  return {} as P;
}

async function resolveParams<P extends Params>(
  context: RouteContext<P>
): Promise<P> {
  return (await context?.params) ?? emptyParams<P>();
}

function wrapRoute<P extends Params>(
  handler: (args: PublicRouteArgs<P> & { user?: User }) => Promise<Response>,
  options: { db?: boolean; auth?: (request: Request) => Promise<User> } = {}
) {
  return async (request: Request, context: RouteContext<P>) => {
    const started = Date.now();
    const requestId = newRequestId();
    const path = requestPath(request);
    const method = request.method;
    const ip = clientIp(request);

    return await runWithRequestContext(
      { requestId, method, path, ip },
      async () => {
        try {
          if (options.db !== false) {
            await ensureDb();
          }
          const user = options.auth ? await options.auth(request) : undefined;
          const store = {
            requestId,
            method,
            path,
            ip,
            userId: user?.id,
            locale: localeFromRequest(request),
          };
          return await runWithRequestContext(store, async () => {
            logger.info("http.request", { status: "start" });
            const params = await resolveParams(context);
            const response = await handler({ request, params, user });
            logger.info("http.request", {
              status: response.status,
              ms: Date.now() - started,
            });
            return response;
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          if (isClientError(error)) {
            logger.warn("http.request_failed", {
              ms: Date.now() - started,
              message,
            });
          } else {
            logger.error("http.request_failed", {
              ms: Date.now() - started,
              message,
              stack: error instanceof Error ? error.stack : undefined,
            });
          }
          return toErrorResponse(error);
        }
      }
    );
  };
}

export function publicRoute<P extends Params = Params>(
  handler: (args: PublicRouteArgs<P>) => Promise<Response>,
  options: { db?: boolean } = {}
) {
  return wrapRoute<P>(handler, options);
}

export function authedRoute<P extends Params = Params>(
  handler: (args: AuthedRouteArgs<P>) => Promise<Response>
) {
  return wrapRoute<P>(
    (args) => handler(args as AuthedRouteArgs<P>),
    { auth: requireUser }
  );
}

export function staffRoute<P extends Params = Params>(
  handler: (args: AuthedRouteArgs<P>) => Promise<Response>
) {
  return wrapRoute<P>(
    (args) => handler(args as AuthedRouteArgs<P>),
    { auth: requireStaffOrAdmin }
  );
}

export function adminRoute<P extends Params = Params>(
  handler: (args: AuthedRouteArgs<P>) => Promise<Response>
) {
  return wrapRoute<P>(
    (args) => handler(args as AuthedRouteArgs<P>),
    { auth: requireAdmin }
  );
}

export function searchParamsOf(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  return request.json();
}
