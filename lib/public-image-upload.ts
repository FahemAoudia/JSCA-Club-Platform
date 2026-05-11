import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

/** Types acceptés pour logo & galerie site public. */
export const PUBLIC_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const PUBLIC_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/** Sur Vercel : pas de FS persistant — data URL en base (limite plus stricte). */
export const PUBLIC_IMAGE_VERCEL_INLINE_MAX_BYTES = 1024 * 1024;

export function publicImageExt(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".bin";
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
  if (process.env.VERCEL === "1") {
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
