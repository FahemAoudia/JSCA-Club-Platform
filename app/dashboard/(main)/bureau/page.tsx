"use client";

import { Shield, Trash2, UserPlus } from "lucide-react";
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
import type { BoardMember } from "@/types";

export default function BureauMembersPage() {
  const toast = useToast();
  const rows = useJscaStore((s) => s.boardMembers);
  const add = useJscaStore((s) => s.addBoardMember);
  const update = useJscaStore((s) => s.updateBoardMember);
  const remove = useJscaStore((s) => s.removeBoardMember);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<BoardMember, "id">>({
    fullName: "",
    role: "",
    phone: "",
    email: "",
    since: new Date().toISOString().slice(0, 10),
    active: true,
  });

  async function save() {
    const created = await add(draft);
    if (!created) {
      toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde impossible." });
      return;
    }
    toast.push({ tone: "success", title: "Enregistré", description: "Membre sauvegardé." });
    setDraft({
      fullName: "",
      role: "",
      phone: "",
      email: "",
      since: new Date().toISOString().slice(0, 10),
      active: true,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Membres du bureau exécutif"
        description="Organigramme — affiché également sur vos rapports officiels JSCA si activé dans paramètres."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="size-4" /> Ajouter au bureau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fiche fonction club</DialogTitle>
                <DialogDescription>Identité officielle du poste désigné.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Nom complet" value={draft.fullName} onChange={(v) => setDraft({ ...draft, fullName: v })} />
                <Field label="Intitulé du rôle" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} />
                <Field label="Téléphone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                <Field label="Email" type="email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                <Field label="Depuis le" type="date" value={draft.since} onChange={(v) => setDraft({ ...draft, since: v })} />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-3">
                <input
                  id="active"
                  type="checkbox"
                  className="size-4 accent-emerald-600"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                <Label htmlFor="active" className="normal-case">
                  Fonction encore active au sein du bureau JSCA.
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save}>
                  Ajouter au bureau directoire
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <Shield className="size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
        Les signataires exportés seront alignés sur ce module une fois la base SQL branchée (Supabase / PostgreSQL / MySQL).
      </div>

      <DataTable<BoardMember>
        rowKey={(r) => r.id}
        searchKeys={["fullName", "role", "email", "phone"]}
        data={rows}
        columns={[
          { key: "fullName", header: "Membre" },
          { key: "role", header: "Fonction" },
          { key: "phone", header: "Téléphone" },
          { key: "email", header: "Email" },
          {
            key: "since",
            header: "Depuis",
            render: (r) => formatDateFr(r.since),
          },
          {
            key: "active",
            header: "Statut",
            render: (r) => (
              <button
                type="button"
                onClick={() => {
                  void update(r.id, { active: !r.active });
                }}
              >
                <Badge tone={r.active ? "green" : "amber"}>{r.active ? "Actif" : "Archivé"}</Badge>
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

function Field({
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
