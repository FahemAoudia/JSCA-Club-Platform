"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { Role } from "@/types";

export default function RolesPage() {
  const roles = useJscaStore((s) => s.roles);
  const add = useJscaStore((s) => s.addRole);
  const update = useJscaStore((s) => s.updateRole);
  const remove = useJscaStore((s) => s.removeRole);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<Role, "id">>({ name: "", permissions: [] });
  const [permText, setPermText] = React.useState("players.read,players.write");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rôles & permissions"
        description="Liste séparée par virgules — compatible future table SQL `role_permissions`."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Nouveau rôle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profil habilitations JSCA</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Nom visible</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <Label>Permissions (liste séparée par virgule)</Label>
                <Textarea rows={3} value={permText} onChange={(e) => setPermText(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const permissions = permText
                      .split(",")
                      .map((p) => p.trim())
                      .filter(Boolean);
                    add({ name: draft.name, permissions });
                    setDraft({ name: "", permissions: [] });
                    setPermText("*");
                    setOpen(false);
                  }}
                >
                  Créer rôle officiel JSCA conseil stratégiques
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<Role>
        rowKey={(r) => r.id}
        data={roles}
        columns={[
          { key: "name", header: "Nom interne JSCA attribuée par présidence" },
          {
            key: "permissions",
            header: "Capacités",
            render: (r) => (
              <Input
                className="font-mono text-xs"
                value={r.permissions.join(", ")}
                onChange={(e) =>
                  update(r.id, {
                    permissions: e.target.value.split(",").map((p) => p.trim()),
                  })
                }
              />
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
