"use client";

import type { Player } from "@/types";
import { BRANCH_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import * as React from "react";
import { useToast } from "@/components/ui/toast";

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function normalizeKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseSportNumber(n: string) {
  const v = Number.parseInt(n.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(v) ? v : null;
}

function nextSportNumber(players: Player[]) {
  const used = new Set<number>();
  for (const p of players) {
    const v = parseSportNumber(p.sportNumber);
    if (v != null) used.add(v);
  }
  let next = 1;
  while (used.has(next)) next += 1;
  return String(next).padStart(2, "0");
}

function autoLicense(branch: Player["branch"], sportNumber: string) {
  const year = new Date().getFullYear();
  return `${branch.toUpperCase()}-JSCA-${year}-${sportNumber}`;
}

type PlayerPhotoUploadResult =
  | { ok: true; player: Player }
  | { ok: false; message?: string };

async function uploadPlayerPhoto(playerId: string, file: File): Promise<PlayerPhotoUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/players/${playerId}/photo`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as {
    ok?: boolean;
    data?: Player;
    message?: string;
  } | null;
  if (!res.ok || !json?.ok || !json.data) {
    return { ok: false, message: json?.message };
  }
  return { ok: true, player: json.data };
}

const emptyPlayer: Omit<Player, "id"> = {
  sportNumber: "",
  licenseNumber: "",
  lastName: "",
  firstName: "",
  fatherName: "",
  motherFullName: "",
  birthWilaya: "",
  birthCommune: "",
  birthDate: "",
  joinDate: new Date().toISOString().slice(0, 10),
  branch: "football",
  groupId: "",
  category: "u13",
  idCardNumber: "",
  bloodType: "",
  weightKg: 0,
  heightCm: 0,
  outfitSize: "",
  shoeSize: "",
  address: "",
  phoneLandline: "",
  phoneMobile: "",
  email: "",
  active: true,
  photoUrl: null,
  parentPhotoUrl: null,
};

export function PlayerForm({
  playerId,
  onDone,
}: {
  playerId?: string;
  onDone?: () => void;
}) {
  const toast = useToast();
  const players = useJscaStore((s) => s.players);
  const sportGroups = useJscaStore((s) => s.sportGroups);
  const addPlayer = useJscaStore((s) => s.addPlayer);
  const updatePlayer = useJscaStore((s) => s.updatePlayer);

  const base = React.useMemo(() => {
    if (!playerId) {
      const autoSport = nextSportNumber(players);
      return { ...emptyPlayer, sportNumber: autoSport, licenseNumber: autoLicense(emptyPlayer.branch, autoSport) };
    }
    const existing = players.find((p) => p.id === playerId);
    if (!existing) return emptyPlayer;
    const { id: _id, ...rest } = existing;
    void _id;
    return rest;
  }, [playerId, players]);

  const [form, setForm] = React.useState(() => base);
  const [saving, setSaving] = React.useState(false);
  const [licenseTouched, setLicenseTouched] = React.useState(false);
  const [pendingPhoto, setPendingPhoto] = React.useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const groupsEligible = React.useMemo(
    () => sportGroups.filter((g) => g.branch === form.branch && g.category === form.category),
    [sportGroups, form.branch, form.category],
  );

  React.useEffect(() => {
    setForm((f) => {
      const eligible = sportGroups.filter((g) => g.branch === f.branch && g.category === f.category);
      if (eligible.some((g) => g.id === f.groupId)) return f;
      return { ...f, groupId: eligible[0]?.id ?? "" };
    });
  }, [form.branch, form.category, sportGroups]);

  React.useEffect(() => {
    if (!pendingPhoto) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingPhoto);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!form.groupId && groupsEligible[0]) {
      setForm((f) => ({ ...f, groupId: groupsEligible[0].id }));
    }
    const groupId = form.groupId || groupsEligible[0]?.id || "";

    if (!playerId) {
      const key = `${normalizeKey(form.lastName)}|${normalizeKey(form.firstName)}|${form.birthDate}`;
      const exists = players.some((p) => `${normalizeKey(p.lastName)}|${normalizeKey(p.firstName)}|${p.birthDate}` === key);
      if (exists) {
        toast.push({ tone: "error", title: "Déjà enregistré", description: "Ce sportif existe déjà." });
        return;
      }
    }

    const sportNumber = form.sportNumber?.trim() ? form.sportNumber.trim() : nextSportNumber(players);
    const licenseNumber = form.licenseNumber?.trim()
      ? form.licenseNumber.trim()
      : autoLicense(form.branch, sportNumber);

    const payload = { ...form, groupId, sportNumber, licenseNumber };

    setSaving(true);
    try {
      let targetId = playerId ?? null;
      if (playerId) {
        const ok = await updatePlayer(playerId, payload);
        if (!ok) throw new Error("save_failed");
      } else {
        const created = await addPlayer(payload);
        if (!created) throw new Error("create_failed");
        targetId = created.id;
      }

      if (pendingPhoto && targetId) {
        const uploaded = await uploadPlayerPhoto(targetId, pendingPhoto);
        if (!uploaded.ok) {
          toast.push({
            tone: "info",
            title: "Photo non enregistrée",
            description:
              uploaded.message ??
              "La fiche est sauvegardée, mais l’envoi de la photo a échoué. Réessayez.",
          });
        } else {
          useJscaStore.setState((s) => ({
            players: s.players.map((p) => (p.id === targetId ? uploaded.player : p)),
          }));
          if (playerId) {
            setForm((f) => ({ ...f, photoUrl: uploaded.player.photoUrl }));
          }
        }
        setPendingPhoto(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
      }

      toast.push({
        tone: "success",
        title: "Enregistré",
        description: "Le sportif a été sauvegardé.",
      });
      if (!playerId) {
        const autoSport = nextSportNumber([...players, { id: "tmp", ...(payload as Omit<Player, "id">) }]);
        setLicenseTouched(false);
        setPendingPhoto(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
        setForm({
          ...emptyPlayer,
          sportNumber: autoSport,
          licenseNumber: autoLicense(emptyPlayer.branch, autoSport),
          joinDate: new Date().toISOString().slice(0, 10),
        });
      }
      onDone?.();
    } catch {
      toast.push({
        tone: "error",
        title: "Erreur",
        description: "Sauvegarde impossible. Vérifiez les champs et réessayez.",
      });
    } finally {
      setSaving(false);
    }
  }

  const field =
    "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 [&>div]:space-y-1.5" as const;

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Identité sportive</h2>
        <div className={cn(field)}>
          <div>
            <Label htmlFor="sportNumber">Numéro sportif</Label>
            <Input
              id="sportNumber"
              value={form.sportNumber}
              onChange={(e) => {
                const v = e.target.value;
                set("sportNumber", v);
                if (!playerId && !licenseTouched) {
                  set("licenseNumber", autoLicense(form.branch, v || nextSportNumber(players)));
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber">Licence sportive</Label>
            <Input
              id="licenseNumber"
              value={form.licenseNumber}
              onChange={(e) => {
                setLicenseTouched(true);
                set("licenseNumber", e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="branch">Branche</Label>
            <select
              id="branch"
              className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              value={form.branch}
              onChange={(e) => {
                const v = e.target.value as typeof form.branch;
                set("branch", v);
                if (!playerId && !licenseTouched) {
                  const sn = form.sportNumber?.trim() ? form.sportNumber.trim() : nextSportNumber(players);
                  set("licenseNumber", autoLicense(v, sn));
                }
              }}
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              value={form.category}
              onChange={(e) => set("category", e.target.value as typeof form.category)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="groupId">Groupe</Label>
            <select
              id="groupId"
              className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              value={form.groupId}
              onChange={(e) => set("groupId", e.target.value)}
            >
              <option value="">Sélectionner…</option>
              {groupsEligible.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-3">
            <input
              id="active"
              type="checkbox"
              className="size-4 accent-emerald-600"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            <Label htmlFor="active" className="normal-case">
              Statut actif
            </Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">État civil & filiation</h2>
        <div className={cn(field)}>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="fatherName">Nom du père</Label>
            <Input id="fatherName" value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="motherFullName">Nom et prénom de la mère</Label>
            <Input id="motherFullName" value={form.motherFullName} onChange={(e) => set("motherFullName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="birthWilaya">Wilaya de naissance</Label>
            <Input id="birthWilaya" value={form.birthWilaya} onChange={(e) => set("birthWilaya", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="birthCommune">Commune de naissance</Label>
            <Input id="birthCommune" value={form.birthCommune} onChange={(e) => set("birthCommune", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="joinDate">Date d’adhésion</Label>
            <Input id="joinDate" type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="idCardNumber">Carte d’identité</Label>
            <Input id="idCardNumber" value={form.idCardNumber} onChange={(e) => set("idCardNumber", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bloodType">Groupe sanguin</Label>
            <Input id="bloodType" value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Morphologie & tenue</h2>
        <div className={cn(field)}>
          <div>
            <Label htmlFor="weightKg">Poids (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              min={0}
              step="0.1"
              value={form.weightKg}
              onChange={(e) => set("weightKg", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="heightCm">Taille (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              min={0}
              value={form.heightCm}
              onChange={(e) => set("heightCm", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="outfitSize">Taille tenue</Label>
            <Input id="outfitSize" value={form.outfitSize} onChange={(e) => set("outfitSize", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="shoeSize">Pointure</Label>
            <Input id="shoeSize" value={form.shoeSize} onChange={(e) => set("shoeSize", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Coordonnées</h2>
        <div className={cn(field)}>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label htmlFor="address">Adresse</Label>
            <Textarea id="address" rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phoneLandline">Téléphone fixe</Label>
            <Input id="phoneLandline" value={form.phoneLandline} onChange={(e) => set("phoneLandline", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phoneMobile">Téléphone mobile</Label>
            <Input id="phoneMobile" value={form.phoneMobile} onChange={(e) => set("phoneMobile", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 space-y-2">
            <Label htmlFor="photoFile">Photo (carte avant)</Label>
            <p className="text-[12px] text-muted-foreground">
              Choisissez une image depuis l’appareil (galerie ou appareil photo). Elle est enregistrée sur le serveur et
              réutilisée pour les cartes sportives. Formats&nbsp;: JPG, PNG, WEBP, GIF — max. 4&nbsp;Mo.
            </p>
            <div className="flex flex-wrap items-start gap-4">
              <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
                {photoPreviewUrl || form.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user upload preview / stored path
                  <img
                    src={photoPreviewUrl ?? form.photoUrl ?? ""}
                    alt=""
                    className="h-40 w-32 object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-32 items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
                    Aperçu
                  </div>
                )}
              </div>
              <Input
                ref={photoInputRef}
                id="photoFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                className="max-w-sm cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) {
                    setPendingPhoto(null);
                    return;
                  }
                  if (!ALLOWED_PHOTO_TYPES.has(f.type)) {
                    toast.push({
                      tone: "error",
                      title: "Format non pris en charge",
                      description: "Utilisez une image JPG, PNG, WEBP ou GIF.",
                    });
                    e.target.value = "";
                    setPendingPhoto(null);
                    return;
                  }
                  setPendingPhoto(f);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : playerId ? "Mettre à jour la fiche" : "Enregistrer le sportif"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setForm(base);
            setLicenseTouched(false);
            setPendingPhoto(null);
            if (photoInputRef.current) photoInputRef.current.value = "";
          }}
        >
          Réinitialiser le formulaire
        </Button>
      </div>
    </form>
  );
}
