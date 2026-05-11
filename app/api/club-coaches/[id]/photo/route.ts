import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { saveDashboardPhoto } from "@/lib/dashboard-photo-storage";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const { id } = await ctx.params;
  const existing = await db.clubCoach.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  const blob = file as Blob;
  const mime = blob.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }

  const buf = Buffer.from(await blob.arrayBuffer());

  const stored = await saveDashboardPhoto({
    entityId: id,
    subdir: "uploads/club-coaches",
    mime,
    buf,
    maxBytesOnDisk: MAX_BYTES,
    existingUrl: existing.photoUrl,
  });

  if (!stored.ok) {
    const msg =
      stored.error === "too_large_vercel"
        ? "Image trop lourde pour l’hébergement Vercel (max 1 Mo). Réduisez la taille ou compressez la photo."
        : undefined;
    return NextResponse.json(
      { ok: false, error: stored.error, message: msg },
      { status: stored.status },
    );
  }

  const updated = await db.clubCoach.update({
    where: { id },
    data: { photoUrl: stored.publicUrl },
  });

  return NextResponse.json({ ok: true, data: updated });
}
