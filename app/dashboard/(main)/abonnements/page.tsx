"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { formatCurrencyDzd, formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { PaymentStatus, Subscription, SubscriptionMode } from "@/types";
import { useToast } from "@/components/ui/toast";

const PAY_STATUS: PaymentStatus[] = ["paye", "partiel", "impaye"];

export default function AbonnementsPage() {
  const toast = useToast();
  const rows = useJscaStore((s) => s.subscriptions);
  const players = useJscaStore((s) => s.players);
  const sportGroups = useJscaStore((s) => s.sportGroups);
  const add = useJscaStore((s) => s.addSubscription);
  const update = useJscaStore((s) => s.updateSubscription);
  const remove = useJscaStore((s) => s.removeSubscription);

  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<Subscription, "id">>({
    playerId: "",
    groupId: "",
    mode: "mensuel",
    paymentDate: new Date().toISOString().slice(0, 10),
    month: new Date().toISOString().slice(0, 7),
    monthlyAmount: 2500,
    amountPaid: 2500,
    paymentStatus: "paye",
    sessionsRemaining: null,
  });

  const playersInSelectedGroup = React.useMemo(
    () => players.filter((p) => p.groupId === draft.groupId),
    [players, draft.groupId],
  );

  function ensureDefaults() {
    setDraft((d) => {
      const groupId = d.groupId || sportGroups[0]?.id || "";
      const list = players.filter((p) => p.groupId === groupId);
      const playerId = list.some((p) => p.id === d.playerId) ? d.playerId : list[0]?.id ?? "";
      return { ...d, groupId, playerId };
    });
  }

  function save() {
    if (saving) return;
    if (!draft.playerId || !draft.groupId) {
      toast.push({
        tone: "error",
        title: "Sélection incomplète",
        description: "Choisissez un groupe avec au moins un sportif.",
      });
      return;
    }
    const dup = rows.some((r) => r.playerId === draft.playerId && r.month === draft.month && r.mode === draft.mode);
    if (dup) {
      toast.push({
        tone: "error",
        title: "Déjà enregistré",
        description: "Un abonnement existe déjà pour ce joueur et ce mois.",
      });
      return;
    }
    setSaving(true);
    try {
      add({
        ...draft,
        sessionsRemaining: draft.mode === "seances" ? draft.sessionsRemaining ?? 0 : null,
      });
      setOpen(false);
      toast.push({ tone: "success", title: "Enregistré", description: "L’abonnement a été sauvegardé." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Abonnements"
        description="Mensualités et forfaits séances — cohérents avec la trésorerie du club."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (v) ensureDefaults();
            }}
          >
            <DialogTrigger asChild>
              <Button>Nouvel abonnement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un abonnement</DialogTitle>
                <DialogDescription>
                  Choisissez d’abord le <strong>groupe</strong> : seuls les sportifs inscrits dans ce groupe sont
                  proposés.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Groupe">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.groupId}
                    onChange={(e) => {
                      const groupId = e.target.value;
                      const list = players.filter((p) => p.groupId === groupId);
                      setDraft({
                        ...draft,
                        groupId,
                        playerId: list.some((p) => p.id === draft.playerId) ? draft.playerId : list[0]?.id ?? "",
                      });
                    }}
                  >
                    {sportGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sportif">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.playerId}
                    onChange={(e) => setDraft({ ...draft, playerId: e.target.value })}
                    disabled={!playersInSelectedGroup.length}
                  >
                    {playersInSelectedGroup.length === 0 ? (
                      <option value="">Aucun sportif dans ce groupe</option>
                    ) : (
                      playersInSelectedGroup.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.lastName} {p.firstName}
                        </option>
                      ))
                    )}
                  </select>
                </Field>
                <Field label="Mode">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.mode}
                    onChange={(e) => setDraft({ ...draft, mode: e.target.value as SubscriptionMode })}
                  >
                    <option value="mensuel">Abonnement mensuel</option>
                    <option value="seances">Abonnement par séances</option>
                  </select>
                </Field>
                <Field label="Date paiement" type="date" value={draft.paymentDate} onChange={(v) => setDraft({ ...draft, paymentDate: String(v) })} />
                <Field label="Mois (AAAA-MM)" value={draft.month} onChange={(v) => setDraft({ ...draft, month: String(v) })} />
                <Field label="Montant mensuel cible" type="number" value={draft.monthlyAmount} onChange={(v) => setDraft({ ...draft, monthlyAmount: Number(v) })} />
                <Field label="Montant payé" type="number" value={draft.amountPaid} onChange={(v) => setDraft({ ...draft, amountPaid: Number(v) })} />
                <Field label="Statut paiement">
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
                    value={draft.paymentStatus}
                    onChange={(e) =>
                      setDraft({ ...draft, paymentStatus: e.target.value as PaymentStatus })
                    }
                  >
                    {PAY_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                {draft.mode === "seances" ? (
                  <Field label="Séances restantes" type="number" value={draft.sessionsRemaining ?? 0} onChange={(v) => setDraft({ ...draft, sessionsRemaining: Number(v) })} />
                ) : (
                  <div />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={save} disabled={!draft.playerId}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable<Subscription>
        rowKey={(r) => r.id}
        data={rows}
        searchKeys={["month"]}
        columns={[
          {
            key: "playerId",
            header: "Joueur",
            render: (r) =>
              `${players.find((p) => p.id === r.playerId)?.lastName ?? "—"}, ${
                players.find((p) => p.id === r.playerId)?.firstName ?? ""
              }`,
          },
          {
            key: "groupId",
            header: "Groupe",
            render: (r) => sportGroups.find((g) => g.id === r.groupId)?.name ?? "—",
          },
          {
            key: "mode",
            header: "Mode",
            render: (r) => (
              <Badge tone={r.mode === "mensuel" ? "violet" : "sky"}>
                {r.mode === "mensuel" ? "Mensuel" : "Par séances"}
              </Badge>
            ),
          },
          {
            key: "paymentDate",
            header: "Paiement",
            render: (r) => formatDateFr(r.paymentDate),
          },
          {
            key: "month",
            header: "Mois",
          },
          {
            key: "monthlyAmount",
            header: "Mensuel cible",
            render: (r) => formatCurrencyDzd(r.monthlyAmount || 0),
          },
          {
            key: "amountPaid",
            header: "Payé",
            render: (r) => formatCurrencyDzd(r.amountPaid),
          },
          {
            key: "paymentStatus",
            header: "Statut",
            render: (r) => (
              <button type="button" onClick={() => cycleStatus(r.id, r.paymentStatus, update)}>
                <Badge tone={r.paymentStatus === "paye" ? "green" : r.paymentStatus === "partiel" ? "amber" : "red"}>
                  {r.paymentStatus}
                </Badge>
              </button>
            ),
          },
          {
            key: "sessionsRemaining",
            header: "Séances",
            render: (r) => (r.sessionsRemaining === null ? "—" : r.sessionsRemaining),
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button size="icon" variant="ghost" type="button" onClick={() => remove(r.id)}>
                <Trash2 className="size-4 text-red-600 dark:text-red-300" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function cycleStatus(
  id: string,
  current: PaymentStatus,
  update: (id: string, patch: Partial<Subscription>) => void,
) {
  const order: PaymentStatus[] = ["paye", "partiel", "impaye"];
  const idx = order.indexOf(current);
  update(id, { paymentStatus: order[(idx + 1) % order.length] });
}

function Field({
  label,
  children,
  type,
  value,
  onChange,
}: {
  label: string;
  children?: React.ReactNode;
  type?: string;
  value?: string | number;
  onChange?: (v: string | number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children ?? (
        <Input
          type={type ?? "text"}
          value={value ?? ""}
          onChange={(e) => onChange?.(type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}
