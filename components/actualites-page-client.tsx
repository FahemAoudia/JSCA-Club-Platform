"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { actualitesUi } from "@/lib/actualites-i18n";
import { LOCALE_STORAGE_KEY, type PublicLocale } from "@/lib/landing-i18n";
import { newsCategory, newsExcerpt, newsTitle } from "@/lib/news-locale";
import { LandingToolbar } from "@/components/landing-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { cn, nextImageUnoptimized } from "@/lib/utils";
import { clubProfile, newsSeed } from "@/data/club";
import type { PublicLandingPayload } from "@/lib/public-landing";

export function ActualitesPageClient() {
  const [payload, setPayload] = React.useState<PublicLandingPayload | null>(null);
  const [locale, setLocale] = React.useState<PublicLocale>("fr");

  React.useEffect(() => {
    void fetch("/api/public/landing", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; data?: PublicLandingPayload }) => {
        if (j?.ok && j.data) setPayload(j.data);
      })
      .catch(() => {});
  }, []);

  const sorted = React.useMemo(() => {
    const list = payload && Array.isArray(payload.news) ? payload.news : newsSeed;
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [payload]);

  React.useEffect(() => {
    try {
      const s = window.localStorage.getItem(LOCALE_STORAGE_KEY) as PublicLocale | null;
      if (s === "fr" || s === "ar") setLocale(s);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const ui = payload?.actualites[locale] ?? actualitesUi[locale];
  const clubPub = payload?.club ?? {
    name: clubProfile.name,
    address: clubProfile.address,
    headquarters: clubProfile.headquarters,
    phone: clubProfile.phone,
    email: clubProfile.email,
  };
  const logoSrc = payload?.logoUrl?.trim() || "/branding/jsca-logo.png";
  const dateLocale = locale === "ar" ? "ar-DZ" : "fr-DZ";

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col bg-background",
        locale === "ar" && "font-[system-ui,'Segoe UI',Tahoma,sans-serif]",
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <header className="sticky top-0 z-50 border-b border-border bg-card/92 backdrop-blur supports-[backdrop-filter]:bg-card/82">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt="JSCA"
              width={52}
              height={52}
              priority
              unoptimized={nextImageUnoptimized(logoSrc)}
              className="size-[52px] rounded-full object-cover shadow-md ring-2 ring-[var(--jsca-gold-border)]"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{ui.headerKicker}</p>
              <p className="font-semibold text-jsca-blue dark:text-foreground">{ui.clubNameShort}</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <LandingToolbar locale={locale} onLocaleChange={setLocale} />
            <Button variant="outline" asChild size="sm">
              <Link href="/">{ui.homeBtn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/login">{ui.adminBtn}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-[var(--jsca-green-deep)] via-[var(--jsca-green-deep)] to-sidebar px-4 py-14 text-sidebar-foreground sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Badge className="mb-4 border-[var(--jsca-gold-border)] bg-black/15 px-3 py-1 text-[var(--jsca-gold)]">{ui.heroBadge}</Badge>
            <h1 className="max-w-3xl text-pretty text-4xl font-bold tracking-tight sm:text-5xl">{ui.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base text-sidebar-foreground/85">
              {ui.heroLead}{" "}
              <span className="font-medium text-[var(--jsca-gold)]">{clubPub.email}</span>
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-muted-foreground">{ui.sectionLead}</h2>
            <div className="grid gap-8">
              {sorted.map((n, index) => (
                <Card
                  key={n.id}
                  className={
                    index === 0
                      ? "overflow-hidden border-2 border-[#e8d567] shadow-lg dark:border-[#b89a2e]/60"
                      : "overflow-hidden border-border transition hover:border-primary/35 hover:shadow-md"
                  }
                >
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <Badge className="border-[#1a237e]/50 bg-[#1a237e]/10 font-semibold uppercase tracking-wide text-[#1a237e] dark:border-white/35 dark:bg-white/12 dark:text-foreground">
                        {newsCategory(n, locale)}
                      </Badge>
                      <time dateTime={n.date} className="text-sm font-medium tabular-nums text-muted-foreground">
                        {new Date(n.date).toLocaleDateString(dateLocale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <CardTitle className="text-pretty text-2xl leading-tight sm:text-3xl">{newsTitle(n, locale)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-foreground/92 dark:text-foreground/88">
                      {newsExcerpt(n, locale)}
                    </CardDescription>
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-dashed border-border pt-6">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`mailto:${clubPub.email}?subject=${encodeURIComponent(
                            locale === "ar" ? `سؤال — ${newsTitle(n, locale)}` : `Question — ${newsTitle(n, locale)}`,
                          )}`}
                        >
                          {ui.reactEmail}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <Card className="sticky top-24 bg-muted/35">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--jsca-green)] font-black text-primary-foreground shadow-inner">
                    ⵣ
                  </span>
                  {ui.asideTitle}
                </CardTitle>
                <CardDescription>{ui.asideDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-card-foreground">{ui.categoriesLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((c) => (
                      <Badge key={c.value} tone="slate" className="bg-card">
                        {c.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{ui.branchesLabel}</p>
                  <ul className="mt-2 space-y-2">
                    {BRANCH_OPTIONS.map((b) => (
                      <li key={b.value} className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[var(--jsca-green)]" />
                        {b.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild className="w-full">
                  <Link href="/#contact">{ui.contactCta}</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-10 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <p className="font-medium text-card-foreground">{clubPub.name}</p>
          <p className="font-medium sm:text-end">{ui.footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
}
