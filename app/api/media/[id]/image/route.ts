import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES,
  publicImageExt,
  resolveImageMime,
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
  const buf = Buffer.from(await blob.arrayBuffer());
  const mime = resolveImageMime(blob.type || "", buf);
  if (!mime) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_type",
        message: "Format non reconnu. Utilisez JPG, PNG, WEBP ou GIF.",
      },
      { status: 400 },
    );
  }
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

  const ext = publicImageExt(mime);
  const filename = `${id}-${Date.now()}${ext}`;
  let publicUrl: string;
  try {
    publicUrl = await writePublicUpload(SUBDIR, filename, buf, mime);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "write_failed",
        message: "Impossible d’enregistrer le fichier image.",
      },
      { status: 500 },
    );
  }

  const oldSrc = existing.src;
  const oldThumb = existing.thumb;
  await tryDeletePublicFile(oldSrc, PREFIX);
  if (oldThumb !== oldSrc) await tryDeletePublicFile(oldThumb, PREFIX);

  let updatedId: string;
  try {
    await db.mediaItem.update({
      where: { id },
      data: {
        src: publicUrl,
        thumb: publicUrl,
        type: "photo",
      },
    });
    updatedId = id;
  } catch (e) {
    console.error("[media image]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "db_update_failed",
        message: "Enregistrement en base impossible. Réessayez ou réduisez la taille de l’image.",
      },
      { status: 500 },
    );
  }

  // Réponse légère : évite les payloads JSON énormes (data URL) côté Vercel.
  return NextResponse.json({ ok: true, id: updatedId });
}
