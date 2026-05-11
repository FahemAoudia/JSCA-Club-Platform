"use client";

import { DatabaseBackup } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function SauvegardePage() {
  const reset = useJscaStore((s) => s.resetMockData);

  function downloadSnapshot() {
    const state = useJscaStore.getState();
    const snapshot = {
      club: state.club,
      players: state.players,
      transactions: state.transactions,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jsca-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sauvegarde base de données — maquette"
        description="Remplacez par pg_dump / mysqldump / exports Supabase Edge Functions selon votre infrastructure finale."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DatabaseBackup className="size-5 text-emerald-600 dark:text-emerald-300" />
            Export JSON instantané de l’état client
          </CardTitle>
          <CardDescription>
            Utile pour démonstrations — ne constitue pas une sauvegarde serveur certifiée.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={downloadSnapshot}>
            Télécharger instantané JSON JSCA
          </Button>
          <Button type="button" variant="outline" onClick={() => reset()}>
            Restaurer les données exemple d’origine
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
