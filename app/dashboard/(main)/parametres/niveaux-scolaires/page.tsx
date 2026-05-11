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
import { useJscaStore } from "@/stores/use-jsca-store";
import type { SchoolLevel } from "@/types";

export default function ParamNiveauxPage() {
  const rows = useJscaStore((s) => s.schoolLevels);
  const add = useJscaStore((s) => s.addSchoolLevel);
  const remove = useJscaStore((s) => s.removeSchoolLevel);
  const update = useJscaStore((s) => s.updateSchoolLevel);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<SchoolLevel, "id">>({ label: "", order: rows.length + 1 });

  function save() {
    add(draft);
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Niveaux scolaires"
        description="Références internes pour dossiers jeunes sportifs."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter niveau</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Libellé & ordre d’affichage</DialogTitle>
              </DialogHeader>
              <Field label="Nom" value={draft.label} onChange={(v) => setDraft({ ...draft, label: String(v) })} />
              <Field label="Ordre" type="number" value={draft.order} onChange={(v) => setDraft({ ...draft, order: Number(v) })} />
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

      <DataTable<SchoolLevel>
        rowKey={(r) => r.id}
        data={[...rows].sort((a, b) => a.order - b.order)}
        columns={[
          { key: "order", header: "Ordre" },
          {
            key: "label",
            header: "Libellé",
            render: (r) => (
              <Input className="h-9" value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} />
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

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
}
