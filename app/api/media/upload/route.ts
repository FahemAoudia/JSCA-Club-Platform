import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_MIME,
  PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES,
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
  const maxBytes =
    process.env.VERCEL === "1" ? PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES : PUBLIC_IMAGE_MAX_BYTES;
  if (buf.length > maxBytes) {
    return NextResponse.json(
      {
        ok: false,
        error: "too_large",
        message:
          process.env.VERCEL === "1"
            ? "Image trop lourde pour Vercel (max 1 Mo). Compressez ou réduisez la taille."
            : "Fichier trop volumineux (max 4 Mo).",
      },
      { status: 413 },
    );
  }

  const nid = id("mg");
  const ext = publicImageExt(mime);
  const filename = `${nid}-${Date.now()}${ext}`;
  let publicUrl: string;
  try {
    publicUrl = await writePublicUpload(SUBDIR, filename, buf, mime);
  } catch {
    return NextResponse.json({ ok: false, error: "write_failed" }, { status: 500 });
  }

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
