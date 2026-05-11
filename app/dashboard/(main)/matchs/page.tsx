"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_OPTIONS, MATCH_TYPE_OPTIONS } from "@/lib/constants";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { MatchRecord, MatchStatus } from "@/types";

const STATUS_ORDER: MatchStatus[] = ["programme", "en_cours", "termine", "reporte", "annule"];

export default function MatchesPage() {
  const rows = useJscaStore((s) => s.matches);
  const add = useJscaStore((s) => s.addMatch);
  const remove = useJscaStore((s) => s.removeMatch);
  const update = useJscaStore((s) => s.updateMatch);

  const [filter, setFilter] = React.useState<typeof rows[number]["type"]>("championnat");

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<MatchRecord, "id">>({
    type: "championnat",
    season: "2025/2026",
    division: "",
    category: "u16",
    date: new Date().toISOString(),
    venue: "",
    homeTeam: "JSCA",
    awayTeam: "",
    homeScore: null,
    awayScore: null,
    status: "programme",
  });

  function persist() {
    add(draft);
    setOpen(false);
  }

  const filteredRows = rows.filter((m) => m.type === filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organisation officielle matchs JSCA"
        description="Triple volet Championnat • Coupe • Tournois — statistiques agrégées côté dashboard global."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Fiche nouveau match</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Composer un nouveau match officiel JSCA</DialogTitle>
                <DialogDescription>Scores laissés vides jusqu’à saisie sur terrain.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Compétition" value={draft.type} onChange={(v) => setDraft({ ...draft, type: v as typeof draft.type })} />
                <InputField label="Saison sportive" value={draft.season} onChange={(v) => setDraft({ ...draft, season: v })} />
                <InputField label="Division" value={draft.division} onChange={(v) => setDraft({ ...draft, division: v })} />
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as MatchRecord["category"] })}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField label="Date & heure (ISO prévue)" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} span />
                <InputField label="Lieu" value={draft.venue} onChange={(v) => setDraft({ ...draft, venue: v })} span />
                <InputField label="Équipe domicile" value={draft.homeTeam} onChange={(v) => setDraft({ ...draft, homeTeam: v })} />
                <InputField label="Score domicile" type="number" value={draft.homeScore ?? ""} onChange={(v) => setDraft({ ...draft, homeScore: v === "" ? null : Number(v) })} />
                <InputField label="Équipe visiteurs" value={draft.awayTeam} onChange={(v) => setDraft({ ...draft, awayTeam: v })} />
                <InputField label="Score visiteur" type="number" value={draft.awayScore ?? ""} onChange={(v) => setDraft({ ...draft, awayScore: v === "" ? null : Number(v) })} />
                <SelectStatus value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={persist}>
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        {MATCH_TYPE_OPTIONS.map((t) => (
          <Button
            key={t.value}
            type="button"
            variant={filter === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <DataTable<MatchRecord>
        rowKey={(r) => r.id}
        data={filteredRows}
        searchKeys={["homeTeam", "awayTeam", "division", "venue"]}
        columns={[
          {
            key: "date",
            header: "Date",
            render: (r) => formatDateFr(r.date),
          },
          { key: "division", header: "Division" },
          {
            key: "category",
            header: "Catégorie",
            render: (r) => CATEGORY_OPTIONS.find((c) => c.value === r.category)?.label ?? r.category,
          },
          { key: "venue", header: "Lieu" },
          { key: "homeTeam", header: "Domicile" },
          {
            key: "homeScore",
            header: "Score",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Input
                  className="h-9 w-16"
                  type="number"
                  value={r.homeScore ?? ""}
                  onChange={(e) =>
                    update(r.id, {
                      homeScore: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  className="h-9 w-16"
                  type="number"
                  value={r.awayScore ?? ""}
                  onChange={(e) =>
                    update(r.id, {
                      awayScore: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            ),
          },
          { key: "awayTeam", header: "Visiteurs" },
          {
            key: "status",
            header: "Statut",
            render: (r) => (
              <button type="button" onClick={() => cycleStatus(r.id, r.status, update)}>
                <Badge tone={r.status === "termine" ? "green" : r.status === "annule" ? "red" : "amber"}>
                  {r.status}
                </Badge>
              </button>
            ),
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button size="icon" variant="ghost" type="button" onClick={() => remove(r.id)}>
                <Trash2 className="size-4 text-red-600 dark:text-red-300" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function cycleStatus(
  id: string,
  current: MatchStatus,
  update: (id: string, patch: Partial<MatchRecord>) => void,
) {
  const idx = STATUS_ORDER.indexOf(current);
  update(id, { status: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] });
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  span,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MatchRecord["type"];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {MATCH_TYPE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectStatus({
  value,
  onChange,
}: {
  value: MatchStatus;
  onChange: (value: MatchStatus) => void;
}) {
  return (
    <div className="md:col-span-2 space-y-1.5">
      <Label>Statut</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as MatchStatus)}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
