import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

/** Types acceptés pour logo & galerie site public. */
export const PUBLIC_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const PUBLIC_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export function publicImageExt(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".bin";
}

export async function writePublicUpload(subdir: string, filename: string, buf: Buffer) {
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
  if (!publicUrl || !publicUrl.startsWith(allowedPrefix)) return;
  try {
    await unlink(publicUrlToAbsolutePath(publicUrl));
  } catch {
    /* ignore */
  }
}
