"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function SeancesCalendarPage() {
  const trainings = useJscaStore((s) => s.trainings);
  const groups = useJscaStore((s) => s.sportGroups);

  const [monthCursor, setMonthCursor] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [groupFilter, setGroupFilter] = React.useState("");

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const label = monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lun=0 … dim=6 style EU
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setMonthCursor(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setMonthCursor(new Date(year, month + 1, 1));
  }

  function sessionsFor(day: number) {
    return trainings.filter((t) => {
      const dt = new Date(t.startAt);
      const matchesDate = dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
      const matchesGroup = !groupFilter || t.groupId === groupFilter;
      return matchesDate && matchesGroup;
    });
  }

  const blanks = Array.from({ length: firstWeekday }).map((_, idx) => <div key={`b-${idx}`} />);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calendrier mensuel JSCA"
        description="Synthèse des séances officiellement programmées — filtre groupe."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/seances">Liste séances</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/seances/nouvelle">Nouvelle séance</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <CardTitle>Mois&nbsp;: {label}</CardTitle>
            <CardDescription>Navigation mois précédent / suivant + filtre groupe.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" aria-label="Mois précédent" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="Mois suivant" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Filtrer par groupe</Label>
              <select
                value={groupFilter}
                className="h-10 min-w-[200px] rounded-lg border border-border bg-muted/40 px-3 text-sm"
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">Tous les groupes</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {blanks}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const items = sessionsFor(day);
              return (
                <div
                  key={day}
                  className="min-h-[120px] rounded-2xl border border-border bg-muted/20 p-2 text-left text-xs text-card-foreground"
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>{day}</span>
                    {items.length ? <Badge tone="green">{items.length}</Badge> : null}
                  </div>
                  <div className="space-y-1">
                    {items.map((t) => (
                      <div key={t.id} className="rounded-lg bg-card p-1.5 text-[10px] shadow-sm">
                        <p className="font-semibold leading-tight">{t.title}</p>
                        <p className="text-muted-foreground">{formatDateFr(t.startAt)}</p>
                        <Badge tone="amber" className="mt-1 text-[9px]">
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
