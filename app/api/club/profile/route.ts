import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const profile = await db.clubProfile.findUnique({ where: { id: "club" }, include: { bankAccounts: true } });
  return NextResponse.json({ ok: true, data: profile });
}

export async function PUT(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;
  const body = (await request.json().catch(() => null)) as {
    profile?: Prisma.ClubProfileUncheckedCreateInput;
    bankAccounts?: Prisma.BankAccountCreateManyInput[];
  } | null;
  if (!body?.profile) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });

  const updated = await db.$transaction(async (tx) => {
    await tx.clubProfile.upsert({
      where: { id: "club" },
      create: { ...body.profile, id: "club" },
      update: { ...body.profile, id: "club" },
      include: { bankAccounts: true },
    });
    if (body.bankAccounts) {
      await tx.bankAccount.deleteMany({ where: { clubId: "club" } });
      if (body.bankAccounts.length) {
        await tx.bankAccount.createMany({
          data: body.bankAccounts.map((b) => ({ ...b, clubId: "club" })),
        });
      }
    }
    return tx.clubProfile.findUnique({ where: { id: "club" }, include: { bankAccounts: true } });
  });

  return NextResponse.json({ ok: true, data: updated });
}

