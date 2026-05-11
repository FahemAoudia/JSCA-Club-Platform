"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { Player } from "@/types";

export default function SportifsListPage() {
  const players = useJscaStore((s) => s.players);
  const groups = useJscaStore((s) => s.sportGroups);
  const remove = useJscaStore((s) => s.removePlayer);

  const branchLabel = (b: Player["branch"]) => BRANCH_OPTIONS.find((x) => x.value === b)?.label ?? b;
  const categoryLabel = (c: Player["category"]) => CATEGORY_OPTIONS.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Liste des sportifs"
        description="Recherche & pagination — prête pour indexation serveur à terme."
        actions={
          <Button asChild>
            <Link href="/dashboard/sportifs/nouveau">Ajouter un sportif</Link>
          </Button>
        }
      />

      <DataTable<Player>
        rowKey={(r) => r.id}
        searchKeys={["firstName", "lastName", "licenseNumber", "sportNumber", "email", "phoneMobile"]}
        data={players}
        columns={[
          { key: "sportNumber", header: "N°" },
          { key: "lastName", header: "Nom" },
          { key: "firstName", header: "Prénom" },
          {
            key: "branch",
            header: "Branche",
            render: (r) => branchLabel(r.branch),
          },
          {
            key: "category",
            header: "Catégorie",
            render: (r) => categoryLabel(r.category),
          },
          {
            key: "groupId",
            header: "Groupe",
            render: (r) => groups.find((g) => g.id === r.groupId)?.name ?? "—",
          },
          {
            key: "joinDate",
            header: "Adhésion",
            render: (r) => formatDateFr(r.joinDate),
          },
          {
            key: "active",
            header: "Statut",
            render: (r) => <Badge tone={r.active ? "green" : "amber"}>{r.active ? "Actif" : "Inactif"}</Badge>,
          },
          {
            key: "id",
            header: "",
            className: "w-[96px]",
            render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" asChild>
                  <Link href={`/dashboard/sportifs/${r.id}`} aria-label="Modifier">
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" type="button" aria-label="Supprimer" onClick={() => remove(r.id)}>
                  <Trash2 className="size-4 text-red-600 dark:text-red-300" />
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
