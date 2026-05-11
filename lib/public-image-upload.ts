import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

/** Types acceptés pour logo & galerie site public. */
export const PUBLIC_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const PUBLIC_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/** Sur Vercel : pas de FS persistant — data URL en base (limite plus stricte). */
export const PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES = 1024 * 1024;

/**
 * Infra sans `public/` persistant (Vercel, preview, `vercel dev`).
 * Ne pas se fier uniquement à `VERCEL=1` (certains runtimes ne l’exposent pas de la même façon).
 */
export function useVercelInlineImageStorage(): boolean {
  if (process.env.VERCEL === "1") return true;
  if (process.env.VERCEL_ENV) return true;
  if (process.env.VERCEL_URL) return true;
  return false;
}

export function publicImageExt(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".bin";
}

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

/** Détecte le type réel (JPEG / PNG / GIF / WebP) à partir des octets. */
export function sniffImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * MIME fiable : alias (`image/jpg`, …) + magic bytes si le navigateur envoie un type faux ou vide.
 */
export function resolveImageMime(mimeHeader: string, buf: Buffer): string | null {
  const raw = (mimeHeader || "").trim().toLowerCase();
  const primary = MIME_ALIASES[raw] ?? raw;
  if (PUBLIC_IMAGE_MIME.has(primary)) return primary;
  const sniffed = sniffImageMime(buf);
  if (sniffed && PUBLIC_IMAGE_MIME.has(sniffed)) return sniffed;
  return null;
}

/**
 * Écrit une image publique : fichier sous `public/<subdir>/` en local,
 * ou `data:` URL sur Vercel (`VERCEL=1`).
 */
export async function writePublicUpload(
  subdir: string,
  filename: string,
  buf: Buffer,
  mime = "image/jpeg",
): Promise<string> {
  if (useVercelInlineImageStorage()) {
    if (buf.length > PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES) {
      throw new Error("too_large_vercel");
    }
    const safeMime = PUBLIC_IMAGE_MIME.has(mime) ? mime : "image/jpeg";
    return `data:${safeMime};base64,${buf.toString("base64")}`;
  }

  if (buf.length > PUBLIC_IMAGE_MAX_BYTES) {
    throw new Error("too_large");
  }

  const dir = join(process.cwd(), "public", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buf);
  return `/${subdir}/${filename}`;
}

/** Chemin disque depuis une URL publique `/uploads/...`. */
export function publicUrlToAbsolutePath(publicUrl: string) {
  const path = publicUrl.replace(/^\//, "");
  return join(process.cwd(), "public", path);
}

export async function tryDeletePublicFile(publicUrl: string | null | undefined, allowedPrefix: string) {
  if (!publicUrl || publicUrl.startsWith("data:")) return;
  if (!publicUrl.startsWith(allowedPrefix)) return;
  try {
    await unlink(publicUrlToAbsolutePath(publicUrl));
  } catch {
    /* ignore */
  }
}
