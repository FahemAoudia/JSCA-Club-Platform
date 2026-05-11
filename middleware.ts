/**
 * Si l’admin est déjà connecté, évite d’afficher inutilement l’écran de mot de passe.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DASH_SESSION_COOKIE, DASH_SESSION_VALUE } from "@/lib/session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(DASH_SESSION_COOKIE)?.value;
  const authenticated = token === DASH_SESSION_VALUE;

  if (pathname === "/dashboard/login" || pathname.startsWith("/dashboard/login/")) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
