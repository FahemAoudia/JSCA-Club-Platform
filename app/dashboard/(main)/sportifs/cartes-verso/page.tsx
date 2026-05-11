"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getPlayerLicenceTheme } from "@/lib/licence-card-themes";
import { cn } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";

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

function PlayerCardsBackPrintPage() {
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
        title="Cartes sportives — verso"
        description="Zone QR / signatures / mentions légales — modèle prêt pour design print."
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
          const v = getPlayerLicenceTheme(p.category).verso;
          const qrValue =
            typeof window === "undefined"
              ? `JSCA:${p.id}`
              : `${window.location.origin}/dashboard/sportifs/${p.id}`;

          return (
            <Card
              key={p.id}
              className={cn(
                "jsca-print-card relative overflow-hidden print:overflow-visible border-2 print:shadow-none",
                v.cardBorder,
              )}
              data-break={layout === "single" ? "after" : undefined}
            >
              <CardContent className="relative h-full print:h-auto p-4 text-sm">
                <div className="flex h-full print:h-auto flex-col justify-between">
                  <div className={cn("flex items-start justify-between gap-3 pb-2", v.headerRule)}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Image src="/jsca-logo.svg" alt="JSCA" width={30} height={30} className="h-7 w-7" priority />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                            Verso administratif
                          </p>
                          <p className="truncate text-sm font-semibold">
                            {p.lastName} {p.firstName} · N° {sportNumber || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className={cn(
                          "flex h-[26mm] w-[26mm] items-center justify-center rounded-xl border border-dashed p-1",
                          v.qrFrame,
                        )}
                      >
                        <QRCode value={qrValue} size={96} className="h-full w-full" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-[11px]">
                    <p className="col-span-2 truncate">
                      <span className="text-muted-foreground">Adresse :</span> {p.address || "—"}
                    </p>
                    <p className="col-span-2 truncate">
                      <span className="text-muted-foreground">Contact :</span>{" "}
                      {p.phoneMobile || p.phoneLandline || "—"}
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">Taille :</span> {p.heightCm} cm
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">Poids :</span> {p.weightKg} kg
                    </p>
                  </div>

                  <div
                    className={cn(
                      "mt-2 rounded-xl border border-transparent p-2 text-[10px] leading-snug text-muted-foreground",
                      v.noticeBg,
                    )}
                  >
                    Le titulaire atteste l’exactitude des informations transmises et accepte le règlement intérieur JSCA.
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-[10px] text-muted-foreground">
                    <div className="space-y-4">
                      <p>Signature du joueur / représentant légal</p>
                      <div className="h-px bg-border" />
                    </div>
                    <div className="space-y-4">
                      <p>Cachet & visa du club</p>
                      <div className="h-px bg-border" />
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

export default function PlayerCardsBackPrintPageWrapper() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Chargement des cartes…
        </div>
      }
    >
      <PlayerCardsBackPrintPage />
    </React.Suspense>
  );
}
