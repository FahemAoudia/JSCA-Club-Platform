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

const PREFIX = "/uploads/landing/";
const SUBDIR = "uploads/landing";

export async function POST(request: Request) {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

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

  const ext = publicImageExt(mime);
  const filename = `logo-${Date.now()}${ext}`;
  const publicUrl = await writePublicUpload(SUBDIR, filename, buf);

  await tryDeletePublicFile(row.logoUrl ?? undefined, PREFIX);

  const updated = await db.landingPageSettings.update({
    where: { id: "landing" },
    data: { logoUrl: publicUrl },
  });

  return NextResponse.json({ ok: true, data: { logoUrl: updated.logoUrl } });
}
