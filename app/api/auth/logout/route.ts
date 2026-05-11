import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { DASH_SESSION_COOKIE } from "@/lib/session";

/** Déconnexion admin : navigation complète (fiabilise la suppression du cookie). */
export async function GET(request: Request) {
  const jar = await cookies();
  jar.set(DASH_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  const url = new URL("/dashboard/login", request.url);
  return NextResponse.redirect(url);
}
