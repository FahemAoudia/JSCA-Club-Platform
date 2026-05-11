"use client";

import * as React from "react";

import Image from "next/image";
import {
  Anchor,
  Image as ImageIcon,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Shirt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { LandingToolbar } from "@/components/landing-toolbar";
import { ContactFormCard } from "@/components/contact-form-card";
import { PublicChatbot } from "@/components/public-chatbot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { cn, nextImageUnoptimized } from "@/lib/utils";
import { LOCALE_STORAGE_KEY, landingStrings, type PublicLocale } from "@/lib/landing-i18n";
import { newsCategory, newsExcerpt, newsTitle } from "@/lib/news-locale";
import { clubProfile, mediaGallerySeed, newsSeed } from "@/data/club";
import { mediaSlotLabel, type PublicLandingPayload } from "@/lib/public-landing";

function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--jsca-green)] dark:text-[var(--jsca-gold)]">
        {kicker}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-pretty text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  const [locale, setLocale] = React.useState<PublicLocale>("fr");
  const [payload, setPayload] = React.useState<PublicLandingPayload | null>(null);

  React.useEffect(() => {
    void fetch("/api/public/landing", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; data?: PublicLandingPayload }) => {
        if (j?.ok && j.data) setPayload(j.data);
      })
      .catch(() => {});
  }, []);

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

  const t = payload?.copy[locale] ?? landingStrings[locale];
  const clubPub = payload?.club ?? {
    name: clubProfile.name,
    address: clubProfile.address,
    headquarters: clubProfile.headquarters,
    phone: clubProfile.phone,
    email: clubProfile.email,
  };
  const headlineNews = React.useMemo(() => {
    const list = payload && Array.isArray(payload.news) ? payload.news : newsSeed;
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 3);
  }, [payload]);
  const galleryMedia = React.useMemo(() => {
    if (payload && Array.isArray(payload.media)) return payload.media;
    return mediaGallerySeed;
  }, [payload]);
  const newsForSection = React.useMemo(() => {
    if (payload && Array.isArray(payload.news)) return payload.news;
    return newsSeed;
  }, [payload]);
  const logoSrc = payload?.logoUrl?.trim() || "/branding/jsca-logo.png";
  const bandEmoji = payload?.bannerEmoji?.trim() || "ⵣ";
  const dateLocale = locale === "ar" ? "ar-DZ" : "fr-FR";

  return (
    <div
      className={cn("flex flex-1 flex-col", locale === "ar" && "font-[system-ui,'Segoe UI',Tahoma,sans-serif]")}
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/92 backdrop-blur supports-[backdrop-filter]:bg-card/78">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt="JSCA"
              width={44}
              height={44}
              unoptimized={nextImageUnoptimized(logoSrc)}
              className="size-11 shrink-0 rounded-full object-cover shadow-md ring-2 ring-[var(--jsca-gold-border)]"
              priority
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t.clubTag}
              </p>
              <p className="text-base font-bold leading-tight text-[#1a237e] dark:text-foreground sm:text-lg">
                {t.clubName}
              </p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <Link
              href="/actualites"
              className="rounded-xl bg-primary px-4 py-2 text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              {t.navNews}
            </Link>
            <a href="#presentation" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-card-foreground">
              {t.navPresentation}
            </a>
            <a href="#branches" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-card-foreground">
              {t.navActivities}
            </a>
            <a href="#actualites" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-card-foreground">
              {t.navNewsSummary}
            </a>
            <a href="#contact" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-card-foreground">
              {t.navContact}
            </a>
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <LandingToolbar locale={locale} onLocaleChange={setLocale} />
            <Button variant="outline" asChild size="sm">
              <Link href="/dashboard/login">{t.adminLogin}</Link>
            </Button>
            <Badge className="border-[var(--jsca-gold-border)] bg-[var(--accent)] font-semibold text-accent-foreground">
              {t.seasonBadge}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative border-b border-[#f0dc6a]/35 bg-sidebar text-sidebar-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_oklch,var(--jsca-red)_12%,transparent)_0%,transparent_38%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
            <div className="flex flex-col justify-center gap-5">
              <div className="flex items-center gap-3">
                <span className="text-5xl leading-none drop-shadow-lg" aria-hidden>
                  {bandEmoji}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--jsca-gold)]">
                    {t.newsBandKicker}
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    {t.newsBandLead}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-[var(--jsca-gold)] font-semibold text-[#1f1603] hover:bg-[#ffe566] hover:text-black">
                  <Link href="/actualites">{t.newsCta}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-[var(--jsca-gold-border)] bg-white/12 text-sidebar-foreground hover:bg-white/22"
                >
                  <Link href={`mailto:${clubPub.email}`}>{t.newsMail}</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
              {headlineNews.map((n, i) => (
                <Link
                  key={n.id}
                  href="/actualites"
                  className={cn(
                    "group flex flex-col rounded-2xl border p-5 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl",
                    i === 0
                      ? "border-[#f9e074] bg-white/96 text-card-foreground dark:border-[#c9a92a]/50 dark:bg-card/92"
                      : "border-white/14 bg-black/22 text-sidebar-foreground backdrop-blur-sm hover:border-[var(--jsca-gold-border)] hover:bg-black/26 dark:border-sidebar-foreground/12 dark:bg-sidebar-foreground/8 dark:text-sidebar-foreground dark:backdrop-blur-none dark:hover:bg-sidebar-foreground/12",
                  )}
                >
                  <time
                    dateTime={n.date}
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-wide",
                      i === 0
                        ? "text-muted-foreground group-hover:text-primary"
                        : "text-sidebar-foreground/75 group-hover:text-[var(--jsca-gold)] dark:group-hover:text-[var(--jsca-gold)]",
                    )}
                  >
                    {new Date(n.date).toLocaleDateString(dateLocale)}
                  </time>
                  <p
                    className={cn(
                      "mt-3 line-clamp-3 text-[15px] font-semibold leading-snug",
                      i === 0 ? "text-card-foreground" : "text-sidebar-foreground",
                    )}
                  >
                    {newsTitle(n, locale)}
                  </p>
                  <p
                    className={cn(
                      "mt-3 line-clamp-3 flex-1 text-xs leading-relaxed",
                      i === 0 ? "text-muted-foreground" : "text-sidebar-foreground/92",
                    )}
                  >
                    {newsExcerpt(n, locale)}
                  </p>
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider",
                      i === 0 ? "text-primary" : "text-[var(--jsca-gold)] drop-shadow-[0_1px_1px_rgb(0_0_0/35)]",
                    )}
                  >
                    {t.readInNews}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(52,211,153,0.28),transparent_54%),radial-gradient(circle_at_90%_-20%,rgba(120,154,246,0.22),transparent_54%)]" />
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-22 sm:px-6 lg:gap-14">
            <div className="relative space-y-6">
              <Badge tone="violet">
                {t.heroBadge}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-pretty text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                  {t.heroTitleBefore}{' '}
                  <span className="text-emerald-600 dark:text-emerald-300">{t.heroTitleAccent}</span>{' '}
                  {t.heroTitleAfter}
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  {clubProfile.headquarters} — {t.heroLead}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={`mailto:${clubPub.email}`}>
                    {t.heroMail} {clubPub.email}
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#actualites">
                    {t.heroAnnouncements}
                  </a>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur sm:min-h-[132px] sm:p-6">
                  <Sparkles className="size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  <div className="mt-4 text-2xl font-semibold leading-tight tracking-tight">{t.statFootballTitle}</div>
                  <p className="mt-2 text-sm leading-snug text-muted-foreground">{t.statFootballSub}</p>
                </div>
                <div className="min-w-0 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur sm:min-h-[132px] sm:p-6">
                  <Shirt className="size-5 shrink-0 text-sky-600 dark:text-sky-300" />
                  <div className="mt-4 break-words text-pretty text-xl font-semibold leading-snug sm:text-2xl">
                    {t.statCategoriesTitle}
                  </div>
                  <p className="mt-2 text-sm leading-snug text-muted-foreground">{t.statCategoriesSub}</p>
                </div>
              </div>
            </div>
            <Card className="relative overflow-hidden rounded-3xl border-border/75 bg-card/94 shadow-xl">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-emerald-500/20 via-transparent to-sky-500/15" />
              <CardHeader>
                <CardTitle>{t.cardInscriptionsTitle}</CardTitle>
                <CardDescription>
                  {t.cardInscriptionsDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild>
                    <Link href="/dashboard/login">{t.cardDashboard}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="#contact">
                      {t.cardSecretariat}
                    </a>
                  </Button>
                </div>
                <div className="grid gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-300" />
                    <span>{clubPub.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-sky-600 dark:text-sky-300" />
                    <span className="font-mono text-card-foreground">{clubPub.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-violet-600 dark:text-violet-300" />
                    <span>{clubPub.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="presentation" className="scroll-mt-26 border-b border-border bg-muted/25 py-14 sm:py-18">
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
            <SectionTitle
              kicker={t.aboutKicker}
              title={t.aboutTitle}
              description={`${clubPub.name} — ${t.aboutDesc}`}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Anchor className="size-4 text-emerald-600 dark:text-emerald-300" />
                    {t.cardQualityTitle}
                  </CardTitle>
                  <CardDescription>
                    {t.cardQualityDesc}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Newspaper className="size-4 text-sky-600 dark:text-sky-300" />
                    {t.cardTransparencyTitle}
                  </CardTitle>
                  <CardDescription>
                    {t.cardTransparencyDesc}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="size-4 text-violet-600 dark:text-violet-300" />
                    {t.cardOmnichannelTitle}
                  </CardTitle>
                  <CardDescription>
                    {t.cardOmnichannelDesc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="branches" className="scroll-mt-26 border-b border-border py-14 sm:py-18">
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
            <SectionTitle
              kicker={t.branchesKicker}
              title={t.branchesTitle}
              description={t.branchesDesc}
            />
            <div className="grid gap-6 lg:grid-cols-[1.08fr_minmax(0,0.92fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t.branchesCardTitle}</CardTitle>
                  <CardDescription>{t.branchesCardDesc}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {BRANCH_OPTIONS.map((b) => (
                    <Badge key={b.value} tone="green">
                      {b.label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.categoriesCardTitle}</CardTitle>
                  <CardDescription>{t.categoriesCardDesc}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((c) => (
                    <Badge key={c.value} tone="violet">
                      {c.label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="actualites" className="scroll-mt-26 bg-muted/20 py-14 sm:py-18">
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
            <SectionTitle
              kicker={t.newsSectionKicker}
              title={t.newsSectionTitle}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {newsForSection.map((n) => (
                <Card key={n.id} className="group transition hover:border-emerald-500/40 hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge tone="amber">{newsCategory(n, locale)}</Badge>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {new Date(n.date).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-snug">{newsTitle(n, locale)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[0.9375rem] leading-relaxed text-foreground/90 dark:text-muted-foreground">
                      {newsExcerpt(n, locale)}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="medias" className="scroll-mt-26 border-t border-border py-14 sm:py-18">
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
            <SectionTitle kicker={t.mediaKicker} title={t.mediaTitle} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryMedia.map((m, idx) => {
                const label = mediaSlotLabel(m, locale);
                const imgSrc = m.type === "photo" ? m.src : m.thumb;
                return (
                  <figure
                    key={m.id}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-inner"
                  >
                    <div className="relative aspect-[16/11] bg-muted">
                      <Image
                        src={imgSrc}
                        alt={label}
                        fill
                        unoptimized={nextImageUnoptimized(imgSrc)}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 py-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                          {t.mediaSlotKicker}
                        </p>
                        <p className="mt-2 text-lg font-semibold leading-tight text-white">{label}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                          {t.mediaCaption} {String(idx + 1)}
                        </p>
                      </div>
                    </div>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-26 border-t border-border py-14 sm:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Card className="overflow-hidden rounded-3xl border-border shadow-lg">
              <CardContent className="space-y-6 p-10">
                <ContactFormCard
                  title={t.contactTitle}
                  description={`${clubPub.name} — ${t.contactDesc}`}
                  locale={locale}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/92 py-10 text-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="space-y-3">
            <p className="text-base font-semibold text-card-foreground">{t.footerName}</p>
            <p>{t.footerLine}</p>
          </div>
          <div className="space-y-1 text-right">
            <p>Tél. {clubPub.phone}</p>
            <p>{clubPub.email}</p>
            <p className="font-medium text-muted-foreground">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>

      <PublicChatbot />
    </div>
  );
}
