import type { MediaItem } from "@/types";

/** URL courte pour servir un média dont le `src` en base est une data URL (évite JSON > limite Vercel). */
export function mediaPublicAssetUrl(id: string): string {
  return `/api/public/media/${id}`;
}

export function mediaRowUsesInlineDataUrl(row: Pick<MediaItem, "src" | "thumb">): boolean {
  return row.src.startsWith("data:") || row.thumb.startsWith("data:");
}

/** Remplace src/thumb data: par une URL API publique (liste admin + landing JSON légers). */
export function mapMediaRowForJsonTransport<T extends MediaItem>(row: T): T {
  if (!mediaRowUsesInlineDataUrl(row)) return row;
  const u = mediaPublicAssetUrl(row.id);
  return { ...row, src: u, thumb: u };
}

export function mapLogoUrlForJsonTransport(logoUrl: string | null | undefined): string | null | undefined {
  if (!logoUrl) return logoUrl;
  if (logoUrl.startsWith("data:")) return "/api/public/landing-logo";
  return logoUrl;
}

export function parseDataUrl(url: string): { mime: string; buf: Buffer } | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(url.trim());
  if (!m) return null;
  try {
    const b64 = m[2].replace(/\s/g, "");
    return { mime: m[1].trim(), buf: Buffer.from(b64, "base64") };
  } catch {
    return null;
  }
}
