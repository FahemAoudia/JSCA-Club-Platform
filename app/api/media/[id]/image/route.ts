import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  PUBLIC_IMAGE_MAX_BYTES,
  PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES,
  publicImageExt,
  resolveImageMime,
  tryDeletePublicFile,
  useVercelInlineImageStorage,
  writePublicUpload,
} from "@/lib/public-image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREFIX = "/uploads/media/";
const SUBDIR = "uploads/media";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
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
      console.error("[media image] db", e);
      let message = "Enregistrement en base impossible. Réessayez ou réduisez la taille de l’image.";
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2000") {
        message =
          "La colonne en base est trop courte pour stocker l’image (data URL). Déployez le schéma Prisma à jour puis exécutez « npx prisma db push » sur la base Neon.";
      }
      return NextResponse.json({ ok: false, error: "db_update_failed", message }, { status: 500 });
    }

    // Réponse légère : évite les payloads JSON énormes (data URL) côté Vercel.
    return NextResponse.json({ ok: true, id: updatedId });
  } catch (e) {
    console.error("[media image] fatal", e);
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message:
          process.env.NODE_ENV !== "production" && e instanceof Error
            ? e.message
            : "Erreur serveur inattendue. Réessayez.",
      },
      { status: 500 },
    );
  }
}
