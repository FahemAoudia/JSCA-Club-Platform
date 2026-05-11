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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { AdminUser } from "@/types";

export default function UtilisateursPage() {
  const users = useJscaStore((s) => s.adminUsers);
  const roles = useJscaStore((s) => s.roles);
  const add = useJscaStore((s) => s.addAdminUser);
  const update = useJscaStore((s) => s.updateAdminUser);
  const remove = useJscaStore((s) => s.removeAdminUser);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<AdminUser, "id">>({
    name: "",
    email: "",
    roleId: roles[0]?.id ?? "",
    active: true,
    lastLogin: null,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Utilisateurs admin"
        description="Prêt pour SSO / OTP — authentification future via Supabase ou stack interne."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Inviter compte</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profil superviseur JSCA</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Nom complet" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <Field label="Email" type="email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                <div className="space-y-1">
                  <Label>Rôle JSCA officiel attribués par président conseil surveillance</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.roleId}
                    onChange={(e) => setDraft({ ...draft, roleId: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    add(draft);
                    setOpen(false);
                  }}
                >
                  Créer compte local maquette
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<AdminUser>
        rowKey={(r) => r.id}
        data={users}
        searchKeys={["name", "email"]}
        columns={[
          { key: "name", header: "Nom" },
          { key: "email", header: "Email" },
          {
            key: "roleId",
            header: "Rôle",
            render: (r) => roles.find((x) => x.id === r.roleId)?.name ?? "—",
          },
          {
            key: "active",
            header: "Statut",
            render: (r) => (
              <button type="button" onClick={() => update(r.id, { active: !r.active })}>
                <Badge tone={r.active ? "green" : "amber"}>{r.active ? "Actif" : "Suspendu"}</Badge>
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
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
