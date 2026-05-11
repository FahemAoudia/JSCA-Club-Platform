import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { mergeActualitesCopy, mergeLandingCopy } from "@/lib/landing-merge";

export const dynamic = "force-dynamic";

export async function GET() {
  const [club, news, media, landing] = await Promise.all([
    db.clubProfile.findUnique({ where: { id: "club" } }),
    db.newsItem.findMany({ orderBy: { date: "desc" } }),
    db.mediaItem.findMany({ orderBy: { id: "asc" } }),
    db.landingPageSettings.findUnique({ where: { id: "landing" } }),
  ]);

  if (!club) {
    return NextResponse.json({ ok: false, error: "club_not_found" }, { status: 500 });
  }

  const row = landing;
  const copy = {
    fr: mergeLandingCopy("fr", row?.copyFr),
    ar: mergeLandingCopy("ar", row?.copyAr),
  };
  const actualites = {
    fr: mergeActualitesCopy("fr", row?.actualitesFr),
    ar: mergeActualitesCopy("ar", row?.actualitesAr),
  };

  return NextResponse.json({
    ok: true,
    data: {
      copy,
      actualites,
      club: {
        name: club.name,
        address: club.address,
        headquarters: club.headquarters,
        phone: club.phone,
        email: club.email,
      },
      news,
      media,
      logoUrl: row?.logoUrl?.trim() || "/branding/jsca-logo.png",
      bannerEmoji: row?.bannerEmoji?.trim() || "ⵣ",
    },
  });
}
