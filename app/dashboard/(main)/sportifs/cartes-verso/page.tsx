"use client";

import * as React from "react";
import Image from "next/image";
import QRCode from "react-qr-code";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  filterPlayersByName,
  PlayerCardNameFilter,
} from "@/components/dashboard/player-card-name-filter";
import { Card, CardContent } from "@/components/ui/card";
import { getPlayerLicenceTheme } from "@/lib/licence-card-themes";
import { licenceCardClasses as L } from "@/lib/licence-card-layout";
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
  const [nameFilter, setNameFilter] = React.useState("");

  const active = React.useMemo(
    () =>
      players
        .filter((p) => p.active)
        .slice()
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr")),
    [players],
  );

  const sportNumbers = React.useMemo(() => computeAutoSportNumbers(active), [active]);
  const rows = React.useMemo(() => filterPlayersByName(active, nameFilter), [active, nameFilter]);

  const [layout, setLayout] = React.useState<"multi" | "single">("multi");

  return (
    <div className="space-y-8 jsca-print-root">
      <PageHeader
        title="Cartes sportives — verso"
        description={
          nameFilter.trim()
            ? `Zone QR / signatures · ${rows.length} / ${active.length} carte(s) · filtre « ${nameFilter.trim()} »`
            : "Zone QR / signatures / mentions légales — modèle prêt pour design print."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <PlayerCardNameFilter value={nameFilter} onChange={setNameFilter} />
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
              <CardContent className={cn("relative", L.content)}>
                <div className={L.versoBody}>
                  <div className={cn(L.versoHeader, v.headerRule)}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <Image src="/jsca-logo.svg" alt="JSCA" width={30} height={30} className={L.logo} priority />
                        <div className="min-w-0">
                          <p className={cn(L.kicker, "font-semibold uppercase text-muted-foreground")}>
                            Verso administratif
                          </p>
                          <p className={cn(L.name, "truncate")}>
                            {p.lastName} {p.firstName} · N° {sportNumber || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={cn(L.qr, "border border-dashed", v.qrFrame)}>
                      <QRCode value={qrValue} size={64} />
                    </div>
                  </div>

                  <div className={L.fields}>
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

                  <div className={cn(L.notice, "border border-transparent text-muted-foreground", v.noticeBg)}>
                    Le titulaire atteste l’exactitude des informations transmises et accepte le règlement intérieur JSCA.
                  </div>

                  <div className={cn(L.signatures, "text-muted-foreground")}>
                    <div>
                      <p>Signature joueur / représentant</p>
                      <div className="h-px bg-border" />
                    </div>
                    <div>
                      <p>Cachet & visa club</p>
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
  return <PlayerCardsBackPrintPage />;
}
