"use client";

import { Globe } from "lucide-react";

import type { PublicLocale } from "@/lib/landing-i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function LandingToolbar({
  locale,
  onLocaleChange,
}: {
  locale: PublicLocale;
  onLocaleChange: (l: PublicLocale) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ThemeToggle />
      <Button
        variant="outline"
        size="sm"
        type="button"
        className="gap-2 font-semibold"
        aria-label={locale === "fr" ? "عرض بالعربية" : "Afficher en français"}
        onClick={() => onLocaleChange(locale === "fr" ? "ar" : "fr")}
      >
        <Globe className="size-4 shrink-0" />
        <span>{locale === "fr" ? "عربي" : "FR"}</span>
      </Button>
    </div>
  );
}
