import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const UPLOAD_SUBDIR = "uploads/players";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".bin";
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const { id } = await ctx.params;
  const existing = await db.player.findUnique({ where: { id } });
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
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const ext = extForMime(mime);
  const filename = `${id}-${Date.now()}${ext}`;
  const dir = join(process.cwd(), "public", UPLOAD_SUBDIR);
  await mkdir(dir, { recursive: true });
  const fullPath = join(dir, filename);
  await writeFile(fullPath, buf);

  const publicUrl = `/${UPLOAD_SUBDIR}/${filename}`;

  const old = existing.photoUrl;
  if (old && old.startsWith(`/${UPLOAD_SUBDIR}/`)) {
    const oldPath = join(process.cwd(), "public", old.replace(/^\//, ""));
    try {
      await unlink(oldPath);
    } catch {
      /* ignore missing file */
    }
  }

  const updated = await db.player.update({
    where: { id },
    data: { photoUrl: publicUrl },
  });

  return NextResponse.json({ ok: true, data: updated });
}
