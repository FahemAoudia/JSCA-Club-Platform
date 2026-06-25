"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useJscaStore } from "@/stores/use-jsca-store";
import { CLUB_CONTACT } from "@/lib/constants";
import { getPlayerLicenceTheme } from "@/lib/licence-card-themes";
import { licenceCardClasses as L } from "@/lib/licence-card-layout";
import { cn } from "@/lib/utils";

function normalizeInt(value: string) {
  const n = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function computeAutoSportNumbers<T extends { id: string; sportNumber: string }>(rows: T[]) {
  const used = new Set<number>();
  for (const r of rows) {
    const n = normalizeInt(r.sportNumber);
    if (n != null) used.add(n);
  }
  let next = 1;
  const out = new Map<string, string>();
  for (const r of rows) {
    if (r.sportNumber?.trim()) {
      out.set(r.id, r.sportNumber);
      continue;
    }
    while (used.has(next)) next += 1;
    used.add(next);
    out.set(r.id, String(next).padStart(2, "0"));
    next += 1;
  }
  return out;
}

function PlayerCardsFrontPrintPage() {
  const players = useJscaStore((s) => s.players);
  const search = useSearchParams();
  const selectedId = search.get("id");

  const active = React.useMemo(
    () =>
      players
        .filter((p) => p.active)
        .slice()
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr")),
    [players],
  );

  const sportNumbers = React.useMemo(() => computeAutoSportNumbers(active), [active]);
  const rows = React.useMemo(
    () => (selectedId ? active.filter((p) => p.id === selectedId) : active),
    [active, selectedId],
  );

  const [layout, setLayout] = React.useState<"multi" | "single">("multi");

  return (
    <div className="space-y-8 jsca-print-root">
      <PageHeader
        title="Cartes sportives — recto"
        description={`Pré-visualisation officielle JSCA (${rows.length}) · impression navigateur`}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <select
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
              value={selectedId ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                const url = new URL(window.location.href);
                if (id) url.searchParams.set("id", id);
                else url.searchParams.delete("id");
                window.history.replaceState(null, "", url.toString());
              }}
            >
              <option value="">Toutes les cartes</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName} {p.firstName}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
              value={layout}
              onChange={(e) => setLayout(e.target.value as "multi" | "single")}
            >
              <option value="multi">Plusieurs par page</option>
              <option value="single">Une carte par page</option>
            </select>
            <button
              type="button"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm"
              onClick={() => window.print()}
            >
              Imprimer ou PDF système
            </button>
          </div>
        }
      />

      <div className={L.sheet} data-layout={layout}>
        {rows.map((p) => {
          const sportNumber = sportNumbers.get(p.id) ?? p.sportNumber ?? "";
          const t = getPlayerLicenceTheme(p.category).recto;
          return (
            <Card
              key={p.id}
              className={cn(
                "jsca-print-card relative overflow-hidden print:overflow-visible border-2 shadow-lg print:shadow-none",
                t.cardFace,
                t.cardBorder,
              )}
              data-break={layout === "single" ? "after" : undefined}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-55 dark:opacity-60 print:opacity-45",
                  t.overlay,
                )}
              />
              <CardContent className={cn("relative", L.content)}>
                <div className={L.body}>
                  <div className={cn(L.sidebar, t.sidebar)}>
                    <div className="flex items-center justify-between gap-1">
                      <Image src="/jsca-logo.svg" alt="JSCA" width={40} height={40} className={L.logo} priority />
                      <div className={cn(L.numberPill, t.numberPill)}>
                        {sportNumber || "—"}
                      </div>
                    </div>

                    <div className={cn(L.photoSlot, t.photoFrame)}>
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" className={L.photoImg} />
                      ) : (
                        <div className={cn(L.photoImg, "flex items-center justify-center text-muted-foreground")}>
                          Photo
                        </div>
                      )}
                    </div>

                    <div className={cn(L.jscaBar, t.jscaBar)}>JSCA · 1986</div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between min-h-0">
                    <div className="flex items-start gap-1.5">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={cn(L.kicker, "font-semibold uppercase text-muted-foreground")}>
                          LICENCE CLUB JSCA
                        </p>
                        <p className={cn(L.name, "truncate")}>
                          {p.lastName.toUpperCase()} {p.firstName}
                        </p>
                        <p className={cn(L.meta, "text-muted-foreground")}>
                          Licence{" "}
                          <span className="font-semibold text-foreground">{p.licenseNumber?.trim() || "—"}</span>
                        </p>
                      </div>
                      <Image
                        src="/branding/jsca-licence-emblem.png"
                        alt="JSCA"
                        width={72}
                        height={72}
                        className={cn(L.emblem, "rounded-full object-cover shadow-sm", t.emblemRing)}
                        priority
                      />
                    </div>

                    <div className={L.fields}>
                      <p className="truncate">
                        <span className="text-muted-foreground">Section</span> · {p.branch}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Catégorie</span> ·{" "}
                        <span className={cn(t.categoryValue)}>{p.category.toUpperCase()}</span>
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Date de naissance</span> ·{" "}
                        {new Date(p.birthDate).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Lieu de naissance</span> ·{" "}
                        {p.birthCommune?.trim() || "—"}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Groupage</span> · {p.bloodType?.trim() || "—"}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Identité</span> · {p.idCardNumber || "—"}
                      </p>
                    </div>

                    <div className={L.badges}>
                      <span className={t.badgeSeason}>Saison 2025/2026</span>
                      <span className={t.badgeOfficial}>Officiel</span>
                    </div>

                    <div className={cn(L.strip, t.contactStrip)}>
                      {CLUB_CONTACT.email} · {CLUB_CONTACT.phone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function PlayerCardsFrontPrintPageWrapper() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Chargement des cartes…
        </div>
      }
    >
      <PlayerCardsFrontPrintPage />
    </React.Suspense>
  );
}
