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
import { useJscaStore } from "@/stores/use-jsca-store";
import type { PlayerMatchStat } from "@/types";

export default function PlayerMatchStatsPage() {
  const stats = useJscaStore((s) => s.playerMatchStats);
  const players = useJscaStore((s) => s.players);
  const matches = useJscaStore((s) => s.matches);
  const add = useJscaStore((s) => s.addPlayerMatchStat);
  const update = useJscaStore((s) => s.updatePlayerMatchStat);
  const remove = useJscaStore((s) => s.removePlayerMatchStat);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<PlayerMatchStat, "id">>({
    playerId: "",
    matchId: "",
    goals: 0,
    assists: 0,
    cardsYellow: 0,
    cardsRed: 0,
    minutesPlayed: 0,
    notes: "",
  });

  const playersForMatch = React.useMemo(() => {
    const m = matches.find((x) => x.id === draft.matchId);
    if (!m) return players;
    return players.filter((p) => p.category === m.category);
  }, [players, matches, draft.matchId]);

  React.useEffect(() => {
    setDraft((d) => {
      const matchId = d.matchId || matches[0]?.id || "";
      const m = matches.find((x) => x.id === matchId);
      const list = m ? players.filter((p) => p.category === m.category) : players;
      const playerId = list.some((p) => p.id === d.playerId) ? d.playerId : list[0]?.id ?? "";
      return { ...d, matchId, playerId };
    });
  }, [players, matches]);

  function persist() {
    if (!draft.matchId || !draft.playerId) return;
    add(draft);
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistiques matchs joueurs"
        description="Ajout lignes KPI — sera relié automatiquement au module matchs officiels."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter une ligne statistiques</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contribution sportive officielle sur un match</DialogTitle>
                <DialogDescription>
                  Buts · passes décisives · discipline · temps jeu. La liste des sportifs correspond à la{" "}
                  <strong>catégorie du match</strong> choisi.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Match officiel JSCA">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.matchId}
                    onChange={(e) => {
                      const matchId = e.target.value;
                      const m = matches.find((x) => x.id === matchId);
                      const list = m ? players.filter((p) => p.category === m.category) : players;
                      setDraft({
                        ...draft,
                        matchId,
                        playerId: list.some((p) => p.id === draft.playerId) ? draft.playerId : list[0]?.id ?? "",
                      });
                    }}
                  >
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.homeTeam} · {new Date(m.date).toLocaleDateString("fr-FR")}
                      </option>
                    ))}
                  </select>
                </SelectField>
                <SelectField label="Sportif">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.playerId}
                    onChange={(e) => setDraft({ ...draft, playerId: e.target.value })}
                    disabled={!playersForMatch.length}
                  >
                    {playersForMatch.length === 0 ? (
                      <option value="">Aucun sportif dans cette catégorie</option>
                    ) : (
                      playersForMatch.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.lastName}&nbsp;{p.firstName}
                        </option>
                      ))
                    )}
                  </select>
                </SelectField>
                <Field label="Buts marqués" type="number" value={draft.goals} onChange={(v) => setDraft({ ...draft, goals: v })} />
                <Field label="Passes décisives" type="number" value={draft.assists} onChange={(v) => setDraft({ ...draft, assists: v })} />
                <Field label="Cartons jaunes" type="number" value={draft.cardsYellow} onChange={(v) => setDraft({ ...draft, cardsYellow: v })} />
                <Field label="Cartons rouges" type="number" value={draft.cardsRed} onChange={(v) => setDraft({ ...draft, cardsRed: v })} />
                <Field label="Minutes jouées" type="number" value={draft.minutesPlayed} onChange={(v) => setDraft({ ...draft, minutesPlayed: v })} span />
              </div>
              <SelectField label="Notes staff technique">
                <Input value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
              </SelectField>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={persist} disabled={!draft.matchId || !draft.playerId}>
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<PlayerMatchStat>
        rowKey={(r) => r.id}
        searchKeys={["notes"]}
        data={stats}
        columns={[
          {
            key: "playerId",
            header: "Sportif",
            render: (r) =>
              `${players.find((p) => p.id === r.playerId)?.lastName ?? "—"}, ${
                players.find((p) => p.id === r.playerId)?.firstName ?? ""
              }`,
          },
          {
            key: "matchId",
            header: "Match",
            render: (r) => matches.find((m) => m.id === r.matchId)?.homeTeam ?? "—",
          },
          {
            key: "goals",
            header: "Buts",
            render: (r) => (
              <InputSmall value={r.goals} onChange={(v) => update(r.id, { goals: v })} />
            ),
          },
          {
            key: "assists",
            header: "Décis.",
            render: (r) => (
              <InputSmall value={r.assists} onChange={(v) => update(r.id, { assists: v })} />
            ),
          },
          {
            key: "minutesPlayed",
            header: "Min",
            render: (r) => (
              <InputSmall value={r.minutesPlayed} onChange={(v) => update(r.id, { minutesPlayed: v })} />
            ),
          },
          {
            key: "cardsYellow",
            header: "",
            render: (r) => <Badge tone="amber">JA {r.cardsYellow}</Badge>,
          },
          {
            key: "cardsRed",
            header: "",
            render: (r) => <Badge tone="red">JR {r.cardsRed}</Badge>,
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button size="icon" variant="ghost" type="button" onClick={() => remove(r.id)} aria-label="Supprimer ligne">
                <Trash2 className="size-4 text-red-600 dark:text-red-300" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  span,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  type?: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      <Input type={type ?? "number"} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InputSmall({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return <Input type="number" className="h-9 max-w-[90px]" value={value} onChange={(e) => onChange(Number(e.target.value))} />;
}
