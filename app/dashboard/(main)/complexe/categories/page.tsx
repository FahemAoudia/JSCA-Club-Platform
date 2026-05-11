import { CATEGORY_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplexeCategoriesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Catégories sportives officielles"
        description="Référentiel homogène pour la branche football du JSCA (U9 → Seniors)."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_OPTIONS.map((c) => (
          <Card key={c.value}>
            <CardHeader>
              <CardTitle>{c.label}</CardTitle>
              <CardDescription>Pools compétitifs & groupes d’initiation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge tone="green">Programme école de sport</Badge>
              <Badge tone="violet">Suivi administratif</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
