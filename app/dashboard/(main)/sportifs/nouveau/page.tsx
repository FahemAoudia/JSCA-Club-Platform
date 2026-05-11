import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlayerForm } from "@/components/forms/player-form";
import { Button } from "@/components/ui/button";

export default function NouveauSportifPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Ajouter un sportif"
        description="Formulaire exhaustif — prêt pour upload photo & scan identité."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/sportifs">Retour à la liste</Link>
          </Button>
        }
      />
      <PlayerForm key="new-player" />
    </div>
  );
}
