import { NextRequest, NextResponse } from "next/server";

import { LOCALES } from "@/constants/locales";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import {
  isAppLocale,
  negotiateLocale,
} from "@/lib/locale";

const LOCALE_COOKIE = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function localeFromRequest(request: NextRequest) {
  const cookieLocale = request.cookies.get(STORAGE_KEYS.LOCALE)?.value;
  if (isAppLocale(cookieLocale)) {
    return cookieLocale;
  }
  return negotiateLocale(request.headers.get("accept-language"));
}

function withLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(STORAGE_KEYS.LOCALE, locale, LOCALE_COOKIE);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment && LOCALES.includes(firstSegment as (typeof LOCALES)[number])) {
    return withLocaleCookie(NextResponse.next(), firstSegment);
  }

  const locale = localeFromRequest(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return withLocaleCookie(NextResponse.redirect(url), locale);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|browserconfig.xml|robots.txt|apple-touch-icon.png|icons/|uploads/|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
