"use client";

import { Building2, Landmark, Save } from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BankAccount } from "@/types";
import { useJscaStore } from "@/stores/use-jsca-store";
import { id } from "@/lib/utils";

export default function ClubDonneesPage() {
  const club = useJscaStore((s) => s.club);
  const updateClub = useJscaStore((s) => s.updateClub);
  const replaceAccounts = useJscaStore((s) => s.replaceBankAccounts);

  const [draft, setDraft] = React.useState(club);
  const [accounts, setAccounts] = React.useState(club.bankAccounts);

  React.useEffect(() => {
    setDraft(club);
    setAccounts(club.bankAccounts);
  }, [club]);

  function save() {
    updateClub({
      name: draft.name,
      address: draft.address,
      phone: draft.phone,
      email: draft.email,
      fax: draft.fax,
      headquarters: draft.headquarters,
      vehicle: draft.vehicle,
    });
    replaceAccounts(accounts);
  }

  function addAccount() {
    const row: BankAccount = { id: id("bk"), label: "", bank: "", rib: "" };
    setAccounts((a) => [...a, row]);
  }

  function updateAccount(idRow: string, patch: Partial<BankAccount>) {
    setAccounts((list) => list.map((x) => (x.id === idRow ? { ...x, ...patch } : x)));
  }

  function removeAccount(idRow: string) {
    setAccounts((list) => list.filter((x) => x.id !== idRow));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Données officielles du club"
        description={`Fiche JSCA · ${club.name}`}
        actions={
          <Button onClick={save} className="gap-2">
            <Save className="size-4" /> Enregistrer
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4 text-emerald-600 dark:text-emerald-300" /> Coordonnées & siège
          </CardTitle>
          <CardDescription>Champs alignés sur vos modules impression & rapports administratifs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nom complet du club">
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </Field>
          <Field label="Téléphone">
            <Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
          </Field>
          <Field label="Email">
            <Input value={draft.email} type="email" onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
          </Field>
          <Field label="Fax">
            <Input value={draft.fax} onChange={(e) => setDraft((d) => ({ ...d, fax: e.target.value }))} />
          </Field>
          <Field label="Adresse siège postal" span>
            <Textarea rows={3} value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} />
          </Field>
          <Field label="Siège · libellé officiel" span>
            <Textarea rows={3} value={draft.headquarters} onChange={(e) => setDraft((d) => ({ ...d, headquarters: e.target.value }))} />
          </Field>
          <Field label="Véhicule club" span>
            <Input value={draft.vehicle} onChange={(e) => setDraft((d) => ({ ...d, vehicle: e.target.value }))} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="size-4 text-sky-600 dark:text-sky-300" /> Comptes bancaires
            </CardTitle>
            <CardDescription>Ajouts / suppression locaux jusqu’à intégration base SQL.</CardDescription>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={addAccount}>
            Ajouter un compte
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {accounts.map((a) => (
            <div key={a.id} className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 md:grid-cols-[1.2fr_1fr_minmax(0,1fr)_auto]">
              <Field label="Libellé">
                <Input value={a.label} onChange={(e) => updateAccount(a.id, { label: e.target.value })} />
              </Field>
              <Field label="Banque">
                <Input value={a.bank} onChange={(e) => updateAccount(a.id, { bank: e.target.value })} />
              </Field>
              <Field label="RIB / IBAN présentés">
                <Input value={a.rib} onChange={(e) => updateAccount(a.id, { rib: e.target.value })} />
              </Field>
              <div className="flex items-end">
                <Button type="button" variant="destructive" onClick={() => removeAccount(a.id)}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
