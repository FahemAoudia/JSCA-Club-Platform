"use client";

import Link from "next/link";
import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRANCH_OPTIONS } from "@/lib/constants";
import { useJscaStore } from "@/stores/use-jsca-store";
import { useToast } from "@/components/ui/toast";

export default function NouvelleSeancePage() {
  const toast = useToast();
  const sportGroups = useJscaStore((s) => s.sportGroups);
  const add = useJscaStore((s) => s.addTraining);
  const trainings = useJscaStore((s) => s.trainings);
  const [saving, setSaving] = React.useState(false);

  const defaults = React.useMemo(() => {
    const pad = (n: number) => `${n}`.padStart(2, "0");
    const now = new Date();
    const end = new Date(now.getTime() + 120 * 60 * 1000);
    const toLocalInput = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { start: toLocalInput(now), end: toLocalInput(end) };
  }, []);

  const [form, setForm] = React.useState({
    title: "",
    groupId: sportGroups[0]?.id ?? "",
    branch: "football" as const,
    startLocal: defaults.start,
    endLocal: defaults.end,
    location: "Complexe JSCA",
    status: "ouverte" as "ouverte" | "fermee" | "annulee",
    notes: "",
  });

  // NOTE: We intentionally avoid effect-driven setState here for lint stability.

  function save() {
    if (saving) return;
    const startAt = new Date(form.startLocal).toISOString();
    const endAt = new Date(form.endLocal).toISOString();
    const title = form.title || "Séance JSCA";
    const dup = trainings.some(
      (t) => t.groupId === form.groupId && t.startAt === startAt && normalize(title) === normalize(t.title),
    );
    if (dup) {
      toast.push({ tone: "error", title: "Déjà enregistrée", description: "Une séance identique existe déjà." });
      return;
    }
    setSaving(true);
    try {
      add({
        title,
        groupId: form.groupId,
        branch: form.branch,
        startAt,
        endAt,
        location: form.location,
        status: form.status,
        notes: form.notes,
      });
      toast.push({ tone: "success", title: "Enregistré", description: "La séance a été sauvegardée." });
    } finally {
      setSaving(false);
    }
  }

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programmer une nouvelle séance"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/seances">Voir la liste</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Titre</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Physique • tactique offensive"
          />
        </div>
        <div className="space-y-2">
          <Label>Groupe concerné</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          >
            {sportGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Branche</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
            value={form.branch}
            onChange={(e) =>
              setForm({ ...form, branch: e.target.value as typeof form.branch })
            }
          >
            {BRANCH_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Début</Label>
          <Input
            type="datetime-local"
            value={form.startLocal}
            onChange={(e) => setForm({ ...form, startLocal: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Fin</Label>
          <Input type="datetime-local" value={form.endLocal} onChange={(e) => setForm({ ...form, endLocal: e.target.value })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Lieu</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
          >
            <option value="ouverte">Ouverte</option>
            <option value="fermee">Fermée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notes internes staff</Label>
          <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer la séance"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/seances/calendrier">Voir calendrier</Link>
        </Button>
      </div>
    </div>
  );
}
