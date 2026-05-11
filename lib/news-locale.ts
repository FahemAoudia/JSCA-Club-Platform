import type { NewsItem } from "@/types";

import type { PublicLocale } from "@/lib/landing-i18n";

export function newsTitle(item: NewsItem, locale: PublicLocale): string {
  if (locale === "ar" && item.titleAr) return item.titleAr;
  return item.title;
}

export function newsExcerpt(item: NewsItem, locale: PublicLocale): string {
  if (locale === "ar" && item.excerptAr) return item.excerptAr;
  return item.excerpt;
}

export function newsCategory(item: NewsItem, locale: PublicLocale): string {
  if (locale === "ar" && item.categoryAr) return item.categoryAr;
  return item.category;
}
