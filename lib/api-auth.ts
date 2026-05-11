import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { DASH_SESSION_COOKIE, DASH_SESSION_VALUE } from "@/lib/session";

export async function requireDashboardAdmin() {
  const jar = await cookies();
  const token = jar.get(DASH_SESSION_COOKIE)?.value;
  const authenticated = token === DASH_SESSION_VALUE;
  if (authenticated) return null;
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

