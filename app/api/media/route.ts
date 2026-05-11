import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { mapMediaRowForJsonTransport } from "@/lib/media-inline-proxy";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const rows = await db.mediaItem.findMany({ orderBy: { id: "asc" } });
  const data = rows.map((r) => mapMediaRowForJsonTransport(r));
  return NextResponse.json(
    { ok: true, data },
    { headers: { "Cache-Control": "private, no-store, must-revalidate" } },
  );
}

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const input = (await request.json().catch(() => null)) as Prisma.MediaItemUncheckedCreateInput | null;
  if (!input?.id || !input.title || !input.type || !input.src || !input.thumb) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  const created = await db.mediaItem.create({ data: input });
  return NextResponse.json({ ok: true, data: created });
}
