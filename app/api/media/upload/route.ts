import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_MIME,
  publicImageExt,
  writePublicUpload,
} from "@/lib/public-image-upload";
import { id } from "@/lib/utils";

export const runtime = "nodejs";

const SUBDIR = "uploads/media";

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });

  const file = form.get("file");
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  if (!title) {
    return NextResponse.json({ ok: false, error: "missing_title" }, { status: 400 });
  }

  const titleArRaw = form.get("titleAr");
  const titleAr = typeof titleArRaw === "string" && titleArRaw.trim() ? titleArRaw.trim() : null;

  const blob = file as Blob;
  const mime = blob.type || "application/octet-stream";
  if (!PUBLIC_IMAGE_MIME.has(mime)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }

  const buf = Buffer.from(await blob.arrayBuffer());
  if (buf.length > PUBLIC_IMAGE_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const nid = id("mg");
  const ext = publicImageExt(mime);
  const filename = `${nid}-${Date.now()}${ext}`;
  const publicUrl = await writePublicUpload(SUBDIR, filename, buf);

  const created = await db.mediaItem.create({
    data: {
      id: nid,
      title,
      titleAr,
      type: "photo",
      src: publicUrl,
      thumb: publicUrl,
    },
  });

  return NextResponse.json({ ok: true, data: created });
}
