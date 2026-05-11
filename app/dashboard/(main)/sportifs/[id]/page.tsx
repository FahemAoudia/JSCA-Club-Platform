"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlayerForm } from "@/components/forms/player-form";
import { Button } from "@/components/ui/button";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function EditSportifPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const exists = useJscaStore((s) => s.players.some((p) => p.id === params.id));

  React.useEffect(() => {
    if (!exists) router.replace("/dashboard/sportifs");
  }, [exists, router]);

  if (!exists) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Fiche introuvable — redirection vers la liste sportifs.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Modifier la fiche sportive"
        description={`Identifiant interne : ${params.id}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/sportifs">Retour à la liste</Link>
          </Button>
        }
      />
      <PlayerForm key={params.id} playerId={params.id} />
    </div>
  );
}
