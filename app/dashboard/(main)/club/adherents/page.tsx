"use client";

import { Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
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
import { useToast } from "@/components/ui/toast";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { Adherent } from "@/types";

export default function ClubAdherentsPage() {
  const toast = useToast();
  const rows = useJscaStore((s) => s.adherents);
  const add = useJscaStore((s) => s.addAdherent);
  const update = useJscaStore((s) => s.updateAdherent);
  const remove = useJscaStore((s) => s.removeAdherent);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<Adherent, "id">>({
    memberNumber: "",
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    joinDate: new Date().toISOString().slice(0, 10),
    active: true,
  });

  async function save() {
    const created = await add(draft);
    if (!created) {
      toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde impossible." });
      return;
    }
    toast.push({ tone: "success", title: "Enregistré", description: "Membre dirigeant sauvegardé." });
    setDraft({
      memberNumber: "",
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
      joinDate: new Date().toISOString().slice(0, 10),
      active: true,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Membres dirigeants"
        description="Membres associatifs (dirigeants / cadre administratif) — données en base PostgreSQL."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/club/cartes-membres">Cartes dirigeants</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="size-4" /> Nouveau membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un membre adhérent</DialogTitle>
                  <DialogDescription>Numérotation interne & statut carte.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Matricule" value={draft.memberNumber} onChange={(v) => setDraft({ ...draft, memberNumber: v })} />
                  <InputField label="Date d’adhésion" type="date" value={draft.joinDate} onChange={(v) => setDraft({ ...draft, joinDate: v })} />
                  <InputField label="Nom" value={draft.lastName} onChange={(v) => setDraft({ ...draft, lastName: v })} />
                  <InputField label="Prénom" value={draft.firstName} onChange={(v) => setDraft({ ...draft, firstName: v })} />
                  <InputField label="Téléphone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                  <InputField label="Email" type="email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                  <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-dashed bg-muted/20 p-3">
                    <input
                      id="active"
                      type="checkbox"
                      className="size-4 accent-emerald-600"
                      checked={draft.active}
                      onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                    />
                    <Label htmlFor="active" className="normal-case">
                      Actif pour impression carte
                    </Label>
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
          </>
        }
      />

      <DataTable<Adherent>
        rowKey={(r) => r.id}
        searchKeys={["memberNumber", "lastName", "firstName", "email", "phone"]}
        data={rows}
        columns={[
          { key: "memberNumber", header: "Matricule" },
          { key: "lastName", header: "Nom" },
          { key: "firstName", header: "Prénom" },
          { key: "phone", header: "Téléphone" },
          { key: "email", header: "Email" },
          {
            key: "joinDate",
            header: "Adhésion",
            render: (r) => formatDateFr(r.joinDate),
          },
          {
            key: "active",
            header: "Statut",
            render: (r) => (
              <button
                type="button"
                className="inline-flex"
                onClick={() => {
                  void update(r.id, { active: !r.active });
                }}
              >
                <Badge tone={r.active ? "green" : "amber"}>{r.active ? "Actif" : "Inactif"}</Badge>
              </button>
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
                aria-label="Supprimer"
                onClick={async () => {
                  const ok = await remove(r.id);
                  if (!ok) toast.push({ tone: "error", title: "Erreur", description: "Suppression impossible." });
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

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
