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
import { useJscaStore } from "@/stores/use-jsca-store";
import type { SchoolResult } from "@/types";

export default function ParamResultatsPage() {
  const rows = useJscaStore((s) => s.schoolResults);
  const add = useJscaStore((s) => s.addSchoolResult);
  const remove = useJscaStore((s) => s.removeSchoolResult);
  const update = useJscaStore((s) => s.updateSchoolResult);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<SchoolResult, "id">>({ label: "" });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Résultats scolaires"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Mention</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Résultat scolaire</DialogTitle>
              </DialogHeader>
              <Label>Libellé</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ label: e.target.value })} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    add(draft);
                    setDraft({ label: "" });
                    setOpen(false);
                  }}
                >
                  Ajouter mention
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<SchoolResult>
        rowKey={(r) => r.id}
        data={rows}
        columns={[
          {
            key: "label",
            header: "Mention officielle JSCA dossier élève-sportifs",
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
