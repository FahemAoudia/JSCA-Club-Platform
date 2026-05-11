"use client";

import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/dashboard/sportifs/cartes", label: "Cartes sportives — recto PDF direct" },
  { href: "/dashboard/sportifs/cartes-verso", label: "Cartes sportives — verso légal / signature" },
  { href: "/dashboard/sportifs/cartes-duplex", label: "Cartes sportives — recto/verso (duplex)" },
  { href: "/dashboard/club/cartes-membres", label: "Cartes dirigeants (gabarit licence JSCA)" },
  { href: "/dashboard/club/cartes-entraineurs", label: "Cartes entraîneurs (catégories + licence)" },
  { href: "/dashboard/finances", label: "Synthèse financière export Excel / PDF navigateur JSCA" },
  { href: "/dashboard/matchs", label: "Exports matchs officiels FAF / région Bouïra préparés" },
] as const;

export default function RapportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Rapports JSCA & impressions directes présidentielles"
        description="Tous les workflows prêts impression navigateur — version serveur PDF headless à brancher plus tard."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Rapports sportifs</CardTitle>
            <CardDescription>Effectifs, stats match, calendrier officiel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/sportifs/stats-matchs">Synthèse KPI performance</Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/seances/calendrier">Calendrier entraînements imprimable</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rapports administratifs</CardTitle>
            <CardDescription>Adhésions, bureau, complexe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/club/adherents">Annuaire dirigeants</Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/bureau">Organigramme direction</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rapports financiers</CardTitle>
            <CardDescription>Exports tableur & PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/finances">Balances & export CSV</Link>
            </Button>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => window.print()}>
              Impression générique page en cours
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accès rapide exports maquettes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {links.map((l) => (
            <Button key={l.href} variant="ghost" asChild className="justify-start">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
