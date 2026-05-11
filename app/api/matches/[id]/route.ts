import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id } = await ctx.params;
  const row = await db.matchRecord.findUnique({ where: { id } });
  return NextResponse.json({ ok: true, data: row });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id } = await ctx.params;
  const patch = (await request.json().catch(() => null)) as Prisma.MatchRecordUpdateInput | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  const updated = await db.matchRecord.update({ where: { id }, data: patch });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id } = await ctx.params;
  await db.matchRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

