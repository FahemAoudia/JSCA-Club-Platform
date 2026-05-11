import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const rows = await db.newsItem.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const input = (await request.json().catch(() => null)) as Prisma.NewsItemUncheckedCreateInput | null;
  if (!input?.id || !input.title || !input.excerpt || !input.date || !input.category) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  const created = await db.newsItem.create({ data: input });
  return NextResponse.json({ ok: true, data: created });
}
