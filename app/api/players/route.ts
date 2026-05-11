import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const rows = await db.player.findMany();
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const input = (await request.json().catch(() => null)) as (Prisma.PlayerCreateInput & {
    parentPhotoUrl?: unknown;
  }) | null;
  if (!input) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });

  // We removed "photo parent" from the app; older clients might still send it.
  // Prisma schema doesn't include this field, so we must ignore it.
  const { parentPhotoUrl: _parentPhotoUrl, ...safe } = input;
  void _parentPhotoUrl;

  const created = await db.player.create({
    data: safe,
  });
  return NextResponse.json({ ok: true, data: created });
}

