"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateFr } from "@/lib/utils";
import { BRANCH_OPTIONS } from "@/lib/constants";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { TrainingSession } from "@/types";
import Link from "next/link";

const ORDER: TrainingSession["status"][] = ["ouverte", "fermee", "annulee"];

export default function SeancesListePage() {
  const trainings = useJscaStore((s) => s.trainings);
  const sportGroups = useJscaStore((s) => s.sportGroups);
  const remove = useJscaStore((s) => s.removeTraining);
  const update = useJscaStore((s) => s.updateTraining);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Séances d’entraînement"
        description="Supervision créneaux, statuts officiels JSCA ouverts / fermés / annulés."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/seances/calendrier">Calendrier mensuel</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/seances/nouvelle">Programmer une séance</Link>
            </Button>
          </>
        }
      />

      <DataTable<TrainingSession>
        rowKey={(r) => r.id}
        data={trainings}
        searchKeys={["title", "location"]}
        columns={[
          { key: "title", header: "Séance" },
          {
            key: "groupId",
            header: "Groupe",
            render: (r) => sportGroups.find((g) => g.id === r.groupId)?.name ?? "—",
          },
          {
            key: "branch",
            header: "Branche",
            render: (r) => BRANCH_OPTIONS.find((b) => b.value === r.branch)?.label ?? r.branch,
          },
          {
            key: "startAt",
            header: "Début",
            render: (r) => formatDateFr(r.startAt),
          },
          {
            key: "endAt",
            header: "Fin",
            render: (r) => formatDateFr(r.endAt),
          },
          { key: "location", header: "Lieu" },
          {
            key: "status",
            header: "Statut",
            render: (r) => (
              <button type="button" onClick={() => cycleStatus(r.id, r.status, update)}>
                <Badge tone={r.status === "ouverte" ? "green" : r.status === "fermee" ? "amber" : "red"}>
                  {r.status}
                </Badge>
              </button>
            ),
          },
          {
            key: "presence",
            header: "Présence",
            render: (r) => (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/seances/${r.id}/presence`}>Présence</Link>
              </Button>
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

function cycleStatus(
  id: string,
  current: TrainingSession["status"],
  update: (id: string, patch: Partial<TrainingSession>) => void,
) {
  const idx = ORDER.indexOf(current);
  update(id, { status: ORDER[(idx + 1) % ORDER.length] });
}
