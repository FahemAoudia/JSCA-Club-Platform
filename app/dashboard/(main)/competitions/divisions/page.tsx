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
import { BRANCH_OPTIONS } from "@/lib/constants";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { CompetitionDivision } from "@/types";

export default function DivisionsPage() {
  const rows = useJscaStore((s) => s.divisions);
  const add = useJscaStore((s) => s.addDivision);
  const remove = useJscaStore((s) => s.removeDivision);
  const update = useJscaStore((s) => s.updateDivision);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<CompetitionDivision, "id">>({
    label: "",
    season: "2025/2026",
    branch: "football",
  });

  function save() {
    add(draft);
    setDraft({ label: "", season: "2025/2026", branch: "football" });
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Divisions Championnat officiel JSCA"
        description="Branches et saisons interconnectées futures avec vos tableaux automatiques classement."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter une division</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Segmentation compétition</DialogTitle>
                <DialogDescription>Libellé libre + saison métier JSCA normalisée.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Division" span value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
                <InputField label="Saison" value={draft.season} onChange={(v) => setDraft({ ...draft, season: v })} />
                <div className="md:col-span-2 space-y-1">
                  <Label>Branche JSCA reliée</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.branch}
                    onChange={(e) => setDraft({ ...draft, branch: e.target.value as CompetitionDivision["branch"] })}
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save}>
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<CompetitionDivision>
        rowKey={(r) => r.id}
        data={rows}
        searchKeys={["label", "season"]}
        columns={[
          {
            key: "label",
            header: "Division",
            render: (r) => (
              <Input className="h-9 min-w-[220px]" value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} />
            ),
          },
          { key: "season", header: "Saison" },
          {
            key: "branch",
            header: "Branche",
            render: (r) => <Badge tone="green">{r.branch}</Badge>,
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

function InputField({
  label,
  value,
  onChange,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
