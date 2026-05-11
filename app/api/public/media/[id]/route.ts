import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { parseDataUrl } from "@/lib/media-inline-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sert le fichier d’un média galerie (data URL en base ou fichier sous /public).
 * Public — pas d’auth (identifiants stables mg1, mg2…).
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = await db.mediaItem.findUnique({ where: { id } });
  if (!row) {
    return new NextResponse(null, { status: 404 });
  }

  const url = row.type === "photo" ? row.src : row.thumb;

  if (url.startsWith("data:")) {
    const parsed = parseDataUrl(url);
    if (!parsed) {
      return new NextResponse(null, { status: 400 });
    }
    return new NextResponse(new Uint8Array(parsed.buf), {
      status: 200,
      headers: {
        "Content-Type": parsed.mime || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (url.startsWith("/")) {
    const target = new URL(url, request.url);
    return NextResponse.redirect(target);
  }

  return new NextResponse(null, { status: 404 });
}
