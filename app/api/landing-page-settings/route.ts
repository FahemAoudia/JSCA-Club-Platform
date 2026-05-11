import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { mergeActualitesCopy, mergeLandingCopy } from "@/lib/landing-merge";
import type { Prisma } from "@prisma/client";

function asJsonObject(v: unknown): Prisma.InputJsonValue {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string") out[k] = val;
  }
  return out as Prisma.InputJsonValue;
}

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const row =
    (await db.landingPageSettings.findUnique({ where: { id: "landing" } })) ??
    (await db.landingPageSettings.create({
      data: {
        id: "landing",
        copyFr: {},
        copyAr: {},
        actualitesFr: {},
        actualitesAr: {},
        logoUrl: null,
        bannerEmoji: "ⵣ",
      },
    }));

  return NextResponse.json({
    ok: true,
    data: {
      copyFr: mergeLandingCopy("fr", row.copyFr),
      copyAr: mergeLandingCopy("ar", row.copyAr),
      actualitesFr: mergeActualitesCopy("fr", row.actualitesFr),
      actualitesAr: mergeActualitesCopy("ar", row.actualitesAr),
      logoUrl: row.logoUrl ?? "",
      bannerEmoji: row.bannerEmoji ?? "ⵣ",
    },
  });
}

export async function PATCH(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    copyFr?: unknown;
    copyAr?: unknown;
    actualitesFr?: unknown;
    actualitesAr?: unknown;
    logoUrl?: string | null;
    bannerEmoji?: string | null;
  } | null;
  if (!body) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });

  const data: Prisma.LandingPageSettingsUpdateInput = {};

  if ("copyFr" in body) data.copyFr = asJsonObject(body.copyFr);
  if ("copyAr" in body) data.copyAr = asJsonObject(body.copyAr);
  if ("actualitesFr" in body) data.actualitesFr = asJsonObject(body.actualitesFr);
  if ("actualitesAr" in body) data.actualitesAr = asJsonObject(body.actualitesAr);
  if ("logoUrl" in body) data.logoUrl = body.logoUrl?.trim() || null;
  if ("bannerEmoji" in body) data.bannerEmoji = body.bannerEmoji?.trim() || "ⵣ";

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "empty_patch" }, { status: 400 });
  }

  const updated = await db.landingPageSettings.upsert({
    where: { id: "landing" },
    create: {
      id: "landing",
      copyFr: "copyFr" in body ? asJsonObject(body.copyFr) : {},
      copyAr: "copyAr" in body ? asJsonObject(body.copyAr) : {},
      actualitesFr: "actualitesFr" in body ? asJsonObject(body.actualitesFr) : {},
      actualitesAr: "actualitesAr" in body ? asJsonObject(body.actualitesAr) : {},
      logoUrl: "logoUrl" in body ? body.logoUrl?.trim() || null : null,
      bannerEmoji: "bannerEmoji" in body ? body.bannerEmoji?.trim() || "ⵣ" : "ⵣ",
    },
    update: data,
  });

  return NextResponse.json({
    ok: true,
    data: {
      copyFr: mergeLandingCopy("fr", updated.copyFr),
      copyAr: mergeLandingCopy("ar", updated.copyAr),
      actualitesFr: mergeActualitesCopy("fr", updated.actualitesFr),
      actualitesAr: mergeActualitesCopy("ar", updated.actualitesAr),
      logoUrl: updated.logoUrl ?? "",
      bannerEmoji: updated.bannerEmoji ?? "ⵣ",
    },
  });
}
