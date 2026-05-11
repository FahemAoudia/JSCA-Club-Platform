"use client";

import { DownloadCloud, Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { formatCurrencyDzd, formatDateFr } from "@/lib/utils";
import { selectorsCashBalance, useJscaStore } from "@/stores/use-jsca-store";
import type { FinanceTransaction, FinanceKind } from "@/types";

type Tab = FinanceKind | "journal";

export default function FinancesPage() {
  const toast = useToast();
  const transactions = useJscaStore((s) => s.transactions);
  const add = useJscaStore((s) => s.addTransaction);
  const update = useJscaStore((s) => s.updateTransaction);
  const remove = useJscaStore((s) => s.removeTransaction);

  const recettes = transactions.filter((t) => t.kind === "recette").reduce((acc, x) => acc + x.amount, 0);
  const depenses = transactions.filter((t) => t.kind === "depense").reduce((acc, x) => acc + x.amount, 0);
  const solde = selectorsCashBalance(transactions);

  const [tab, setTab] = React.useState<Tab>("journal");
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<FinanceTransaction, "id">>({
    kind: "recette",
    label: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: "",
    reference: "",
  });

  async function persist() {
    const created = await add(draft);
    if (!created) {
      toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde impossible." });
      return;
    }
    toast.push({ tone: "success", title: "Enregistré", description: "Écriture sauvegardée." });
    setOpen(false);
  }

  function exportCsv() {
    const header = "kind;label;amount;date;category;reference";
    const body = transactions
      .map((t) => [t.kind, t.label.replace(/;/g, ","), t.amount, t.date, t.category, t.reference].join(";"))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jsca-finances-export-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const filtered =
    tab === "journal"
      ? transactions
      : transactions.filter((t) => t.kind === tab);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finances JSCA agrégées"
        description="Recettes locales / sponsors / déplacement — solde automatique puis export fichier."
        actions={
          <>
            <Button variant="outline" className="gap-2" type="button" onClick={() => window.print()}>
              <DownloadCloud className="size-4" /> PDF navigateur rapide
            </Button>
            <Button variant="outline" type="button" onClick={exportCsv}>
              Export Excel-compatible CSV JSCA officiel localement
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Nouvelle écriture</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ligne mouvements trésorerie club</DialogTitle>
                  <DialogDescription>À connecter automatiquement post-prod depuis banque nationale partenaires.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectKind value={draft.kind} onChange={(v) => setDraft({ ...draft, kind: v })} />
                  <InputField label="Montant DA" type="number" value={draft.amount} onChange={(v) => setDraft({ ...draft, amount: Number(v) })} />
                  <InputField label="Libellé" span value={draft.label} onChange={(v) => setDraft({ ...draft, label: String(v) })} />
                  <InputField label="Date" type="date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: String(v) })} />
                  <InputField label="Rubrique JSCA conseillée" value={draft.category} onChange={(v) => setDraft({ ...draft, category: String(v) })} />
                  <InputField label="Réf administrative" value={draft.reference} onChange={(v) => setDraft({ ...draft, reference: String(v) })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="button" onClick={persist}>
                    Enregistrer l’écriture
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard accent="emerald" label="Recettes JSCA suivies depuis base locale mémoire" value={formatCurrencyDzd(recettes)} />
        <StatCard accent="sky" label="Dépenses / charges officiellement saisies" value={formatCurrencyDzd(depenses)} />
        <StatCard accent="violet" label="Solde trésorerie instantanément recalculé" value={formatCurrencyDzd(solde)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === "journal" ? "default" : "outline"} size="sm" type="button" onClick={() => setTab("journal")}>
          Historique complet
        </Button>
        <Button variant={tab === "recette" ? "default" : "outline"} size="sm" type="button" onClick={() => setTab("recette")}>
          Recettes
        </Button>
        <Button variant={tab === "depense" ? "default" : "outline"} size="sm" type="button" onClick={() => setTab("depense")}>
          Dépenses
        </Button>
      </div>

      <DataTable<FinanceTransaction>
        rowKey={(r) => r.id}
        data={filtered}
        searchKeys={["label", "category", "reference"]}
        columns={[
          {
            key: "kind",
            header: "Type",
            render: (r) => <Badge tone={r.kind === "recette" ? "green" : "amber"}>{r.kind}</Badge>,
          },
          { key: "label", header: "Libellé officiel JSCA présidentielle" },
          {
            key: "amount",
            header: "Montant",
            render: (r) => formatCurrencyDzd(r.amount),
          },
          {
            key: "date",
            header: "Date mouvements",
            render: (r) => formatDateFr(r.date),
          },
          {
            key: "category",
            header: "Catégorie",
            render: (r) => (
              <Input
                className="h-9 min-w-[180px]"
                value={r.category}
                onChange={(e) => {
                  void update(r.id, { category: e.target.value });
                }}
              />
            ),
          },
          { key: "reference", header: "Référence officielle JSCA suivie conseil d’administration" },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button
                size="icon"
                variant="ghost"
                type="button"
                aria-label="Supprimer écritures"
                onClick={async () => {
                  const ok = await remove(r.id);
                  if (!ok) toast.push({ tone: "error", title: "Erreur", description: "Suppression impossible." });
                }}
              >
                <Trash2 className="size-4 text-red-600 dark:text-red-300" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function SelectKind({
  value,
  onChange,
}: {
  value: FinanceKind;
  onChange: (v: FinanceKind) => void;
}) {
  return (
    <div className="space-y-1 md:col-span-2">
      <Label>Type d’écriture</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as FinanceKind)}
      >
        <option value="recette">Recette</option>
        <option value="depense">Dépense</option>
      </select>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type,
  span,
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type?: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      <Input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
}
