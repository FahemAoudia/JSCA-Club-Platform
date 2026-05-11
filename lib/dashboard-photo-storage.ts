import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

/** Sur Vercel le FS du bundle est en lecture seule : pas de fichiers persistants dans `public/`. */
const VERCEL_INLINE_MAX_BYTES = 1024 * 1024; // 1 Mo — suffisant pour une photo carte

function extForMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".bin";
}

async function tryUnlinkDiskPublicUrl(publicUrl: string | null, subdir: string) {
  if (!publicUrl || !publicUrl.startsWith(`/${subdir}/`)) return;
  const rel = publicUrl.replace(/^\//, "");
  const fullPath = join(process.cwd(), "public", rel);
  try {
    await unlink(fullPath);
  } catch {
    /* fichier absent ou FS read-only */
  }
}

/**
 * Enregistre une image dashboard (joueur / entraîneur).
 * - **Hors Vercel** : fichier sous `public/<subdir>/`.
 * - **Sur Vercel** : `data:` URL stockée en base (pas de disque).
 */
export async function saveDashboardPhoto(args: {
  entityId: string;
  subdir: "uploads/players" | "uploads/club-coaches";
  mime: string;
  buf: Buffer;
  maxBytesOnDisk: number;
  existingUrl: string | null;
}): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string; status: number }> {
  const { entityId, subdir, mime, buf, maxBytesOnDisk, existingUrl } = args;

  if (process.env.VERCEL === "1") {
    if (buf.length > VERCEL_INLINE_MAX_BYTES) {
      return {
        ok: false,
        error: "too_large_vercel",
        status: 413,
      };
    }
    await tryUnlinkDiskPublicUrl(existingUrl, subdir);
    const publicUrl = `data:${mime};base64,${buf.toString("base64")}`;
    return { ok: true, publicUrl };
  }

  if (buf.length > maxBytesOnDisk) {
    return { ok: false, error: "too_large", status: 413 };
  }

  const ext = extForMime(mime);
  const filename = `${entityId}-${Date.now()}${ext}`;
  const dir = join(process.cwd(), "public", subdir);
  await mkdir(dir, { recursive: true });
  const fullPath = join(dir, filename);
  await writeFile(fullPath, buf);

  const publicUrl = `/${subdir}/${filename}`;

  await tryUnlinkDiskPublicUrl(existingUrl, subdir);

  return { ok: true, publicUrl };
}
