import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { parseDataUrl } from "@/lib/media-inline-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sert le logo page d’accueil si stocké en data URL (réponse landing JSON allégée). */
export async function GET(request: Request) {
  const row = await db.landingPageSettings.findUnique({ where: { id: "landing" } });
  const url = row?.logoUrl?.trim();
  if (!url?.startsWith("data:")) {
    if (url?.startsWith("/")) {
      return NextResponse.redirect(new URL(url, request.url));
    }
    return new NextResponse(null, { status: 404 });
  }

  const parsed = parseDataUrl(url);
  if (!parsed) {
    return new NextResponse(null, { status: 400 });
  }

  return new NextResponse(new Uint8Array(parsed.buf), {
    status: 200,
    headers: {
      "Content-Type": parsed.mime || "application/octet-stream",
      "Cache-Control": "private, no-store, must-revalidate",
    },
  });
}
