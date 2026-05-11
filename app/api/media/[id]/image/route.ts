import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_MIME,
  publicImageExt,
  tryDeletePublicFile,
  writePublicUpload,
} from "@/lib/public-image-upload";

export const runtime = "nodejs";

const PREFIX = "/uploads/media/";
const SUBDIR = "uploads/media";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const { id } = await ctx.params;
  const existing = await db.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });

  const file = form.get("file");
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  const blob = file as Blob;
  const mime = blob.type || "application/octet-stream";
  if (!PUBLIC_IMAGE_MIME.has(mime)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }

  const buf = Buffer.from(await blob.arrayBuffer());
  if (buf.length > PUBLIC_IMAGE_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const ext = publicImageExt(mime);
  const filename = `${id}-${Date.now()}${ext}`;
  const publicUrl = await writePublicUpload(SUBDIR, filename, buf);

  const oldSrc = existing.src;
  const oldThumb = existing.thumb;
  await tryDeletePublicFile(oldSrc, PREFIX);
  if (oldThumb !== oldSrc) await tryDeletePublicFile(oldThumb, PREFIX);

  const updated = await db.mediaItem.update({
    where: { id },
    data: {
      src: publicUrl,
      thumb: publicUrl,
      type: "photo",
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
