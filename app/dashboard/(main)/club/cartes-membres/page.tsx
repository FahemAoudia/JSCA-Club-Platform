"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useJscaStore } from "@/stores/use-jsca-store";
import { CLUB_CONTACT, CATEGORY_OPTIONS } from "@/lib/constants";
import { DIRIGEANT_LICENCE_RECTO } from "@/lib/licence-card-themes";
import { licenceCardClasses as L } from "@/lib/licence-card-layout";
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

      <div className={L.sheet} data-layout={layout}>
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
            <CardContent className={cn("relative", L.content)}>
              <div className={L.body}>
                <div className={cn(L.sidebar, t.sidebar)}>
                  <div className="flex items-center justify-between gap-1">
                    <Image src="/jsca-logo.svg" alt="JSCA" width={40} height={40} className={L.logo} priority />
                    <div className={cn(L.numberPill, t.numberPill)}>{m.memberNumber?.trim() || "—"}</div>
                  </div>

                  <div className={cn(L.photoSlot, t.photoFrame)}>
                    <div className={cn(L.photoImg, "flex items-center justify-center px-1 text-center text-muted-foreground")}>
                      Membre dirigeant
                    </div>
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
                        {m.lastName.toUpperCase()} {m.firstName}
                      </p>
                      <p className={cn(L.meta, "text-muted-foreground")}>
                        Matricule{" "}
                        <span className="font-semibold text-foreground">{m.memberNumber?.trim() || "—"}</span>
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

                  <div className={L.badges}>
                    <span className={t.badgeSeason}>Saison 2025/2026</span>
                    <span className={t.badgeOfficial}>Membre dirigeant</span>
                  </div>

                  <div className={cn(L.strip, t.contactStrip)}>
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
