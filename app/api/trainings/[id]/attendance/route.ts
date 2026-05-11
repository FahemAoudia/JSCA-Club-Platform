import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id: trainingId } = await ctx.params;
  const rows = await db.trainingAttendance.findMany({ where: { trainingId } });
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id: trainingId } = await ctx.params;
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    playerId?: string;
    status?: "present" | "absent";
    markedAt?: string;
  } | null;
  if (!body?.playerId || (body.status !== "present" && body.status !== "absent")) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  const markedAt = body.markedAt ?? new Date().toISOString();
  const upserted = await db.trainingAttendance.upsert({
    where: {
      trainingId_playerId: { trainingId, playerId: body.playerId },
    },
    create: {
      id: body.id ?? `${trainingId}_${body.playerId}`,
      training: { connect: { id: trainingId } },
      player: { connect: { id: body.playerId } },
      status: body.status,
      markedAt,
    } satisfies Prisma.TrainingAttendanceCreateInput,
    update: { status: body.status, markedAt } satisfies Prisma.TrainingAttendanceUpdateInput,
  });
  return NextResponse.json({ ok: true, data: upserted });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const { id: trainingId } = await ctx.params;
  await db.trainingAttendance.deleteMany({ where: { trainingId } });
  return NextResponse.json({ ok: true });
}

