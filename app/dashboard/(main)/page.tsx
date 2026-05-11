"use client";

import {
  Activity,
  Banknote,
  PieChart as PieIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyDzd, formatDateFr } from "@/lib/utils";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { useJscaStore, selectorsCashBalance } from "@/stores/use-jsca-store";
import type { Branch, Category } from "@/types";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, x) => {
    acc[x] = (acc[x] ?? 0) + 1;
    return acc;
  }, {});
}

export default function DashboardHomePage() {
  const [chartsReady, setChartsReady] = React.useState(false);
  React.useEffect(() => {
    setChartsReady(true);
  }, []);

  const hydrated = useJscaStore((s) => s.hydrated);
  const players = useJscaStore((s) => s.players);
  const adherents = useJscaStore((s) => s.adherents);
  const clubCoaches = useJscaStore((s) => s.clubCoaches);
  const transactions = useJscaStore((s) => s.transactions);
  const allActivities = useJscaStore((s) => s.activities);
  const activities = React.useMemo(() => allActivities.slice(0, 8), [allActivities]);
  const subscriptions = useJscaStore((s) => s.subscriptions);

  const recettes = transactions.filter((t) => t.kind === "recette").reduce((a, x) => a + x.amount, 0);
  const depenses = transactions.filter((t) => t.kind === "depense").reduce((a, x) => a + x.amount, 0);
  const solde = selectorsCashBalance(transactions);

  const activePlayers = players.filter((p) => p.active).length;
  const activeCoaches = clubCoaches.filter((c) => c.active).length;

  const branchCounts = countBy(players.map((p) => p.branch)) as Record<Branch, number>;
  const categoryCounts = countBy(players.map((p) => p.category)) as Record<Category, number>;

  const branchChart = BRANCH_OPTIONS.map((b) => ({
    branche: b.label,
    total: branchCounts[b.value] ?? 0,
  }));

  const categoryChart = CATEGORY_OPTIONS.map((c) => ({
    categorie: c.label,
    total: categoryCounts[c.value] ?? 0,
  }));

  const monthlyFlow = [
    { mois: "Jan", recettes: 42000, depenses: 18500 },
    { mois: "Fév", recettes: 39000, depenses: 21000 },
    { mois: "Mar", recettes: 84500, depenses: 138500 },
    { mois: "Avr", recettes: 52000, depenses: 24000 },
    { mois: "Mai", recettes: 61000, depenses: 28000 },
  ];

  const newMembers = [...adherents]
    .sort((a, b) => +new Date(b.joinDate) - +new Date(a.joinDate))
    .slice(0, 6);

  if (!hydrated) {
    return (
      <div className="space-y-10">
        <PageHeader
          title="Tableau de bord principal"
          description="Chargement des données depuis la base..."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/40" />
          <div className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/40" />
          <div className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/40" />
          <div className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/40" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,340px)]">
          <div className="h-[380px] animate-pulse rounded-2xl border border-border bg-muted/40" />
          <div className="h-[380px] animate-pulse rounded-2xl border border-border bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Tableau de bord principal"
        description="Vue agrégée : effectifs sportifs, dirigeants et encadrement, segmentation par âge/branche puis indicateurs financiers."
        actions={
          <Badge tone="violet">
            Flux live store Zustand — prévu export API serveur ensuite
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="emerald"
          icon={<Users className="size-4 text-emerald-600 dark:text-emerald-300" />}
          label="Sportifs visibles"
          value={activePlayers}
          hint={`${players.length - activePlayers} fiches inactives ou archivées`}
        />
        <StatCard
          accent="green"
          icon={<Users className="size-4 text-green-600 dark:text-green-300" />}
          label="Entraîneurs actifs"
          value={activeCoaches}
          hint="Encadrement par catégorie · cartes entraîneurs."
        />
        <StatCard
          accent="violet"
          icon={<PieIcon className="size-4 text-violet-600 dark:text-violet-300" />}
          label="Abonnements suivis"
          value={subscriptions.length}
          hint="Mensuels ou par séances restantes · module dédié ci-contre sidebar."
        />
        <StatCard
          accent="amber"
          icon={<TrendingUp className="size-4 text-amber-600 dark:text-amber-300" />}
          label="Solde caisse (calcul temps réel)"
          value={formatCurrencyDzd(solde)}
          hint={`Recettes ${formatCurrencyDzd(recettes)} — Dépenses ${formatCurrencyDzd(depenses)}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,340px)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-emerald-600 dark:text-emerald-300" />
              Dynamique financière illustrative
            </CardTitle>
            <CardDescription>
              Courbes maîtresses — vos futurs dashboards pourront refléter un export SQL précis par exercice civique.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] min-h-[280px] min-w-0 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlow} margin={{ top: 16, left: 0, right: 16, bottom: 0 }}>
                <defs>
                  <linearGradient id="clrRecettes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clrDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mois" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <Tooltip />
                <Area type="monotone" dataKey="recettes" stroke="#10b981" strokeWidth={2} fill="url(#clrRecettes)" name="Recettes cumulées" />
                <Area type="monotone" dataKey="depenses" stroke="#3b82f6" strokeWidth={2} fill="url(#clrDepenses)" name="Charges cumulées" />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[260px] w-full animate-pulse rounded-xl bg-muted/55" aria-hidden />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières activités</CardTitle>
            <CardDescription>Journal issu du store JSCA après chaque opération métier CRUD démo.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[320px] space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            {activities.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-card-foreground">{a.title}</p>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{formatDateFr(a.at)}</span>
                </div>
                {a.detail ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Sportifs actifs · répartition branches</CardTitle>
            <CardDescription>Alignement catégories & groupes football issus du module sportifs JSCA.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[260px] min-w-0 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChart} margin={{ top: 8, bottom: 0, left: 0, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="branche" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[10, 10, 10, 10]} fill="url(#barGradGreen)" />
                  <defs>
                    <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(16,185,129)" />
                      <stop offset="100%" stopColor="rgb(5,150,105)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[240px] w-full animate-pulse rounded-xl bg-muted/55" aria-hidden />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelles adhésions dirigeants</CardTitle>
            <CardDescription>Tri récent depuis la liste des membres dirigeants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {m.firstName}&nbsp;{m.lastName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.memberNumber}</p>
                </div>
                <Badge tone="sky">{formatDateFr(m.joinDate)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-5 text-sky-600 dark:text-sky-300" />
              Statistiques par catégories officielles
            </CardTitle>
            <CardDescription>
              Synthèses U9 → Seniors utilisées également pour quotas compétitions FAF région Bouïra.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[260px] min-w-0 w-full">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 16, bottom: 0, left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="categorie" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[240px] w-full animate-pulse rounded-xl bg-muted/55" aria-hidden />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
