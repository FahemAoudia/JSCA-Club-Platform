"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useJscaStore } from "@/stores/use-jsca-store";
import { CLUB_CONTACT } from "@/lib/constants";
import { getPlayerLicenceTheme } from "@/lib/licence-card-themes";
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

export default function PlayerCardsFrontPrintPage() {
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

      <div
        className="jsca-print-sheet grid gap-8 md:grid-cols-2 print:grid-cols-2 print:gap-0"
        data-layout={layout}
      >
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
              <CardContent className="relative h-full print:h-auto p-4">
                <div className="flex h-full print:h-auto gap-4">
                  <div
                    className={cn(
                      "flex w-[36mm] shrink-0 flex-col justify-between rounded-2xl border p-2.5",
                      t.sidebar,
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Image src="/jsca-logo.svg" alt="JSCA" width={40} height={40} className="h-9 w-9" priority />
                      <div
                        className={cn(
                          "rounded-xl px-2 py-1 text-[11px] font-extrabold tracking-wide",
                          t.numberPill,
                        )}
                      >
                        {sportNumber || "—"}
                      </div>
                    </div>

                    <div className={cn("mt-2 overflow-hidden rounded-xl bg-muted/20", t.photoFrame)}>
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" className="h-[45mm] w-full object-cover" />
                      ) : (
                        <div className="flex h-[45mm] w-full items-center justify-center text-[10px] text-muted-foreground">
                          Photo 3.5×4.5
                        </div>
                      )}
                    </div>

                    <div
                      className={cn(
                        "mt-2 rounded-xl border px-2 py-1.5 text-[10px] font-semibold text-muted-foreground",
                        t.jscaBar,
                      )}
                    >
                      JSCA · 1986
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                          LICENCE CLUB JSCA
                        </p>
                        <p className="truncate text-lg font-semibold leading-tight">
                          {p.lastName.toUpperCase()} {p.firstName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Licence{" "}
                          <span className="font-semibold text-foreground">{p.licenseNumber?.trim() || "—"}</span>
                        </p>
                      </div>
                      <Image
                        src="/branding/jsca-licence-emblem.png"
                        alt="JSCA"
                        width={72}
                        height={72}
                        className={cn(
                          "h-[72px] w-[72px] shrink-0 rounded-full object-cover shadow-sm print:h-[18mm] print:w-[18mm]",
                          t.emblemRing,
                        )}
                        priority
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
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

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={cn("text-[10px]", t.badgeSeason)}>Saison 2025/2026</span>
                      <span className={cn("text-[10px]", t.badgeOfficial)}>Officiel</span>
                    </div>

                    <div
                      className={cn(
                        "mt-2 rounded-xl border px-2.5 py-2 text-[10px] text-muted-foreground",
                        t.contactStrip,
                      )}
                    >
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
