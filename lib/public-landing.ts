import type { ActualitesCopy, LandingCopy } from "@/lib/landing-merge";
import type { PublicLocale } from "@/lib/landing-i18n";
import type { MediaItem, NewsItem } from "@/types";

export type PublicLandingPayload = {
  copy: Record<PublicLocale, LandingCopy>;
  actualites: Record<PublicLocale, ActualitesCopy>;
  club: {
    name: string;
    address: string;
    headquarters: string;
    phone: string;
    email: string;
  };
  news: NewsItem[];
  media: MediaItem[];
  logoUrl: string;
  bannerEmoji: string;
};

export function mediaSlotLabel(m: MediaItem, locale: PublicLocale) {
  if (locale === "ar" && m.titleAr?.trim()) return m.titleAr.trim();
  return m.title;
}
