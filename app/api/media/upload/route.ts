import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES,
  publicImageExt,
  resolveImageMime,
  useVercelInlineImageStorage,
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
  const maxBytes = useVercelInlineImageStorage()
    ? PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES
    : PUBLIC_IMAGE_MAX_BYTES;
  if (buf.length > maxBytes) {
    return NextResponse.json(
      {
        ok: false,
        error: "too_large",
        message: useVercelInlineImageStorage()
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
    return NextResponse.json(
      {
        ok: false,
        error: "write_failed",
        message: "Impossible d’enregistrer le fichier image.",
      },
      { status: 500 },
    );
  }

  try {
    await db.mediaItem.create({
      data: {
        id: nid,
        title,
        titleAr,
        type: "photo",
        src: publicUrl,
        thumb: publicUrl,
      },
    });
  } catch (e) {
    console.error("[media upload]", e);
    let message = "Enregistrement en base impossible. Réessayez ou réduisez la taille de l’image.";
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2000") {
      message =
        "La base de données refuse l’image (colonne trop courte). Exécutez une fois `npx prisma db push` sur la base Neon production (schema Prisma avec @db.Text).";
    }
    return NextResponse.json(
      {
        ok: false,
        error: "db_create_failed",
        message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: nid });
}
