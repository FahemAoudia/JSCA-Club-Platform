"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useJscaStore } from "@/stores/use-jsca-store";
import { CLUB_CONTACT, CATEGORY_OPTIONS } from "@/lib/constants";
import { DIRIGEANT_LICENCE_RECTO } from "@/lib/licence-card-themes";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const t = DIRIGEANT_LICENCE_RECTO;

function categoryLabel(c: Category) {
  return CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c.toUpperCase();
}

function DirigeantCardsPrintPage() {
  const adherents = useJscaStore((s) => s.adherents);
  const sportGroups = useJscaStore((s) => s.sportGroups);
  const search = useSearchParams();
  const selectedId = search.get("id");

  const active = React.useMemo(
    () =>
      adherents
        .filter((a) => a.active)
        .slice()
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr")),
    [adherents],
  );

  const rows = React.useMemo(
    () => (selectedId ? active.filter((a) => a.id === selectedId) : active),
    [active, selectedId],
  );

  const [layout, setLayout] = React.useState<"multi" | "single">("multi");

  const groupCategories = React.useMemo(() => {
    const set = new Set<Category>();
    for (const g of sportGroups) set.add(g.category);
    return [...set].sort();
  }, [sportGroups]);

  const categoriesLine =
    groupCategories.length > 0 ? groupCategories.map((c) => categoryLabel(c)).join(" · ") : "—";

  return (
    <div className="space-y-8 jsca-print-root">
      <PageHeader
        title="Cartes dirigeants — recto"
        description={`Pré-visualisation JSCA (${rows.length}) · même gabarit que les cartes sportives`}
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
              {active.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.lastName} {a.firstName}
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
        {rows.map((m) => (
          <Card
            key={m.id}
            className={cn(
              "jsca-print-card relative overflow-hidden print:overflow-visible border-2 shadow-lg print:shadow-none",
              t.cardBorder,
            )}
            data-break={layout === "single" ? "after" : undefined}
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90", t.overlay)} />
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
                      {m.memberNumber?.trim() || "—"}
                    </div>
                  </div>

                  <div className={cn("mt-2 overflow-hidden rounded-xl bg-muted/20", t.photoFrame)}>
                    <div className="flex h-[45mm] w-full items-center justify-center px-2 text-center text-[10px] leading-snug text-muted-foreground">
                      Membre dirigeant
                      <br />
                      JSCA
                    </div>
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
                        {m.lastName.toUpperCase()} {m.firstName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Matricule{" "}
                        <span className="font-semibold text-foreground">{m.memberNumber?.trim() || "—"}</span>
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
                      <span className="text-muted-foreground">Section</span> · football
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">Fonction</span> · dirigeant
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">Adhésion</span> ·{" "}
                      {m.joinDate ? new Date(m.joinDate).toLocaleDateString("fr-FR") : "—"}
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">Catégories club</span> · {categoriesLine}
                    </p>
                    <p className="truncate col-span-2">
                      <span className="text-muted-foreground">Contact</span> · {m.phone?.trim() || "—"} ·{" "}
                      {m.email?.trim() || "—"}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn("text-[10px]", t.badgeSeason)}>Saison 2025/2026</span>
                    <span className={cn("text-[10px]", t.badgeOfficial)}>Membre dirigeant</span>
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
        ))}
      </div>
    </div>
  );
}

export default function DirigeantCardsPrintPageWrapper() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Chargement des cartes…
        </div>
      }
    >
      <DirigeantCardsPrintPage />
    </React.Suspense>
  );
}
