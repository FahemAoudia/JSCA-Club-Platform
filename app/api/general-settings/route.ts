import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const row = await db.generalSettings.findUnique({ where: { id: "settings" } });
  return NextResponse.json({ ok: true, data: row });
}

export async function PUT(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const patch = (await request.json().catch(() => null)) as Prisma.GeneralSettingsUpdateInput | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  const updated = await db.generalSettings.upsert({
    where: { id: "settings" },
    create: { id: "settings", ...(patch as Prisma.GeneralSettingsCreateInput) },
    update: patch,
  });
  return NextResponse.json({ ok: true, data: updated });
}

