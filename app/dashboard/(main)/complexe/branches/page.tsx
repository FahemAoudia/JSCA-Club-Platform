import { BRANCH_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ComplexeBranchesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Branches du JSCA"
        description="Branche football du club : pilotage des budgets, dotations et groupes d’entraînement."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl">
        {BRANCH_OPTIONS.map((b) => (
          <Card key={b.value} className="border-emerald-500/25">
            <CardHeader>
              <CardTitle>{b.label}</CardTitle>
              <CardDescription>
                Pilotage KPI spécifique (prévu modules analytiques lors de la connexion base SQL).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <Badge tone="green">Encadrement désigné</Badge>
              <p>Structures compétitives, planning complexe JSCA synchronisées avec vos groupes officiels.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
