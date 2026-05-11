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
          ? "Logo trop lourd pour Vercel (max 1 Mo). Compressez l’image."
          : "Fichier trop volumineux (max 4 Mo).",
      },
      { status: 413 },
    );
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

  await tryDeletePublicFile(row.logoUrl ?? undefined, PREFIX);

  try {
    await db.landingPageSettings.update({
      where: { id: "landing" },
      data: { logoUrl: publicUrl },
    });
  } catch (e) {
    console.error("[landing-logo]", e);
    let message = "Enregistrement du logo impossible. Réessayez ou réduisez la taille de l’image.";
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2000") {
      message =
        "La base de données refuse le logo (colonne trop courte). Exécutez une fois `npx prisma db push` sur la base Neon production (schema Prisma avec @db.Text).";
    }
    return NextResponse.json(
      {
        ok: false,
        error: "db_update_failed",
        message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
