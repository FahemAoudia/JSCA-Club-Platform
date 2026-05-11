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
import type { Opponent } from "@/types";

export default function AdversairesPage() {
  const rows = useJscaStore((s) => s.opponents);
  const add = useJscaStore((s) => s.addOpponent);
  const update = useJscaStore((s) => s.updateOpponent);
  const remove = useJscaStore((s) => s.removeOpponent);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<Opponent, "id">>({
    name: "",
    city: "",
    contact: "",
    phone: "",
  });

  function save() {
    add(draft);
    setDraft({ name: "", city: "", contact: "", phone: "" });
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Équipes adverses"
        description="Annuaire partenaires / rivaux — sera synchronisé pour matchs officiels automatiquement à terme."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Nouvelle équipe advers</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fiche équipe rivale JSCA</DialogTitle>
                <DialogDescription>Renseignez la cellule communiquée par la ligue régionale Bouïra.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Nom du club" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} span />
                <InputField label="Ville" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
                <InputField label="Contact réf." value={draft.contact} onChange={(v) => setDraft({ ...draft, contact: v })} />
                <InputField label="Téléphone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save}>
                  Ajouter cette équipe
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<Opponent>
        rowKey={(r) => r.id}
        data={rows}
        searchKeys={["name", "city", "phone"]}
        columns={[
          { key: "name", header: "Club" },
          {
            key: "city",
            header: "Ville",
            render: (r) => (
              <Input value={r.city} onChange={(e) => update(r.id, { city: e.target.value })} className="h-9" />
            ),
          },
          {
            key: "contact",
            header: "Contact",
            render: (r) => (
              <Input value={r.contact} onChange={(e) => update(r.id, { contact: e.target.value })} className="h-9" />
            ),
          },
          {
            key: "phone",
            header: "Téléphone",
            render: (r) => (
              <Input value={r.phone} onChange={(e) => update(r.id, { phone: e.target.value })} className="h-9" />
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
