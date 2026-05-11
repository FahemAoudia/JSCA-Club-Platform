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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import type { SportGroup } from "@/types";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function ComplexeGroupesPage() {
  const toast = useToast();
  const rows = useJscaStore((s) => s.sportGroups);
  const add = useJscaStore((s) => s.addSportGroup);
  const update = useJscaStore((s) => s.updateSportGroup);
  const remove = useJscaStore((s) => s.removeSportGroup);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<SportGroup, "id">>({
    name: "",
    branch: "football",
    category: "u13",
    coach: "",
    scheduleNote: "",
  });

  async function save() {
    const created = await add(draft);
    if (!created) {
      toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde impossible." });
      return;
    }
    toast.push({ tone: "success", title: "Enregistré", description: "Groupe sauvegardé." });
    setOpen(false);
    setDraft({
      name: "",
      branch: "football",
      category: "u13",
      coach: "",
      scheduleNote: "",
    });
  }

  const branchLabel = (b: SportGroup["branch"]) => BRANCH_OPTIONS.find((x) => x.value === b)?.label ?? b;
  const catLabel = (c: SportGroup["category"]) => CATEGORY_OPTIONS.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Groupes d’entraînement"
        description="Chaque groupe combine branche + catégorie + encadrant pour filtrer vos séances."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Nouveau groupe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Structurer un groupe JSCA</DialogTitle>
                <DialogDescription>Aligné sur complexe sportif & module sportifs.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Nom du groupe" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Branche</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                      value={draft.branch}
                      onChange={(e) => setDraft({ ...draft, branch: e.target.value as SportGroup["branch"] })}
                    >
                      {BRANCH_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Catégorie</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value as SportGroup["category"] })}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Field label="Encadrant" value={draft.coach} onChange={(v) => setDraft({ ...draft, coach: v })} />
                <div className="space-y-1.5">
                  <Label>Créneaux / planning</Label>
                  <Textarea rows={3} value={draft.scheduleNote} onChange={(e) => setDraft({ ...draft, scheduleNote: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save}>
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<SportGroup>
        rowKey={(r) => r.id}
        data={rows}
        searchKeys={["name", "coach"]}
        columns={[
          { key: "name", header: "Groupe" },
          {
            key: "branch",
            header: "Branche",
            render: (r) => <Badge tone="green">{branchLabel(r.branch)}</Badge>,
          },
          {
            key: "category",
            header: "Catégorie",
            render: (r) => <Badge tone="violet">{catLabel(r.category)}</Badge>,
          },
          { key: "coach", header: "Encadrant" },
          {
            key: "scheduleNote",
            header: "Planning",
            render: (r) => (
              <Input
                className="h-9"
                value={r.scheduleNote}
                onChange={(e) => {
                  void update(r.id, { scheduleNote: e.target.value });
                }}
              />
            ),
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={async () => {
                  const ok = await remove(r.id);
                  if (!ok) {
                    toast.push({
                      tone: "error",
                      title: "Suppression impossible",
                      description: "Ce groupe contient des sportifs. Déplacez-les vers un autre groupe puis réessayez.",
                    });
                  }
                }}
              >
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
