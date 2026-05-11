"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function ParamGeneralPage() {
  const settings = useJscaStore((s) => s.generalSettings);
  const patch = useJscaStore((s) => s.updateGeneralSettings);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Informations générales système JSCA SaaS évolutifs"
        description="Bloc transversal stocké hors du module club légal officiel lorsque vos microservices seront multiples."
      />
      <div className="rounded-3xl border border-border bg-muted/25 p-6 space-y-4 max-w-xl">
        <div className="space-y-1">
          <Label>Nom court apparaissant UI</Label>
          <input
            className="flex h-10 w-full rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/20"
            value={settings.clubShortName}
            onChange={(e) => patch({ clubShortName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Devise comptabilité officielle JSCA suivie par trésorerie</Label>
          <input
            className="flex h-10 w-full rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/20"
            value={settings.defaultCurrency}
            onChange={(e) => patch({ defaultCurrency: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Langue interface actuelle (arabe prévu RTL)</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-border bg-muted/60 px-3 text-sm"
            value={settings.futureLocale}
            onChange={(e) => patch({ futureLocale: e.target.value as "fr" | "ar" })}
          >
            <option value="fr">Français (actif officiel projet)</option>
            <option value="ar">Arabe — activer dir rtl sur le layout racine</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          <Badge tone="violet">{settings.locale.toUpperCase()}</Badge>
          <Badge tone="amber">Futur multilingual pack</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Les changements sont appliqués immédiatement via le store applicatif (persistance navigateur possible en extension).
        </p>
      </div>
    </div>
  );
}
