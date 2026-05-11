import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const rows = await db.role.findMany();
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const input = (await request.json().catch(() => null)) as Prisma.RoleCreateInput | null;
  if (!input) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  const created = await db.role.create({ data: input });
  return NextResponse.json({ ok: true, data: created });
}

