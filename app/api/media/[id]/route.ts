import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { tryDeletePublicFile } from "@/lib/public-image-upload";
import type { Prisma } from "@prisma/client";

const MEDIA_PREFIX = "/uploads/media/";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id } = await ctx.params;
  const patch = (await request.json().catch(() => null)) as Prisma.MediaItemUpdateInput | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  const updated = await db.mediaItem.update({ where: { id }, data: patch });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id } = await ctx.params;
  const row = await db.mediaItem.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  await tryDeletePublicFile(row.src, MEDIA_PREFIX);
  if (row.thumb !== row.src) await tryDeletePublicFile(row.thumb, MEDIA_PREFIX);
  await db.mediaItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
