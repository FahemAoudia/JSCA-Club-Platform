"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { CompetitionProgramEntry } from "@/types";

export default function CompetitionProgramPage() {
  const rows = useJscaStore((s) => s.competitionProgram);
  const add = useJscaStore((s) => s.addProgramEntry);
  const update = useJscaStore((s) => s.updateProgramEntry);
  const remove = useJscaStore((s) => s.removeProgramEntry);

  const [open, setOpen] = React.useState(false);
  const pad = React.useCallback((input: Date) => {
    const tz = `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, "0")}-${String(
      input.getDate(),
    ).padStart(2, "0")}T${String(input.getHours()).padStart(2, "0")}:${String(input.getMinutes()).padStart(2, "0")}`;
    return tz;
  }, []);

  const [draft, setDraft] = React.useState({
    title: "",
    dateLocal: pad(new Date()),
    location: "",
    phase: "",
    notes: "",
  });

  function save() {
    add({
      title: draft.title,
      date: new Date(draft.dateLocal).toISOString(),
      location: draft.location,
      phase: draft.phase,
      notes: draft.notes,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programme officiel JSCA exportable"
        description="Pilotage événements ligue / coupe — sera relié automatiquement à vos modules match."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter un créneau</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Construire votre programme saisonniers</DialogTitle>
                <DialogDescription>Planning homogène français prêt impressions rapports officiels JSCA.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Titre officiel événement" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                <Field label="Date & heure" type="datetime-local" value={draft.dateLocal} onChange={(v) => setDraft({ ...draft, dateLocal: v })} />
                <Field label="Lieu" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
                <Field label="Phase (aller / coupe / gala)" value={draft.phase} onChange={(v) => setDraft({ ...draft, phase: v })} />
                <div className="space-y-1.5">
                  <Label>Notes logistiques</Label>
                  <Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save}>
                  Valider événement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<CompetitionProgramEntry>
        rowKey={(r) => r.id}
        data={rows}
        searchKeys={["title", "location", "phase"]}
        columns={[
          { key: "title", header: "Épreuve JSCA planifiée" },
          {
            key: "date",
            header: "Date",
            render: (r) => formatDateFr(r.date),
          },
          { key: "location", header: "Lieu" },
          { key: "phase", header: "Phase" },
          {
            key: "notes",
            header: "",
            render: (r) => (
              <Input className="h-9 min-w-[200px]" value={r.notes ?? ""} onChange={(e) => update(r.id, { notes: e.target.value })} />
            ),
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button variant="ghost" size="icon" type="button" onClick={() => remove(r.id)}>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
