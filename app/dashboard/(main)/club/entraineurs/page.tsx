"use client";

import { Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
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
import { useToast } from "@/components/ui/toast";
import { autoCoachLicense, nextStaffNumber } from "@/lib/club-coach-numbers";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { Category, ClubCoach } from "@/types";

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function categoryLabels(cats: Category[]) {
  return cats
    .map((c) => CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c.toUpperCase())
    .join(", ");
}

type CoachPhotoUploadResult =
  | { ok: true; coach: ClubCoach }
  | { ok: false; message?: string };

async function uploadClubCoachPhoto(coachId: string, file: File): Promise<CoachPhotoUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/club-coaches/${coachId}/photo`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as {
    ok?: boolean;
    data?: ClubCoach;
    message?: string;
  } | null;
  if (!res.ok || !json?.ok || !json.data) {
    return { ok: false, message: json?.message };
  }
  return { ok: true, coach: json.data };
}

function emptyDraft(sn: string, lic: string): Omit<ClubCoach, "id"> {
  return {
    staffNumber: sn,
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    joinDate: new Date().toISOString().slice(0, 10),
    active: true,
    licenseNumber: lic,
    diploma: "",
    photoUrl: null,
    categories: [],
  };
}

export default function ClubEntraineursPage() {
  const toast = useToast();
  const rows = useJscaStore((s) => s.clubCoaches);
  const add = useJscaStore((s) => s.addClubCoach);
  const update = useJscaStore((s) => s.updateClubCoach);
  const remove = useJscaStore((s) => s.removeClubCoach);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<ClubCoach, "id">>(() => {
    const sn = nextStaffNumber([]);
    return emptyDraft(sn, autoCoachLicense(sn));
  });
  const [licenseTouched, setLicenseTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pendingPhoto, setPendingPhoto] = React.useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!pendingPhoto) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingPhoto);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  function resetFormForNewCoach() {
    const coaches = useJscaStore.getState().clubCoaches;
    const sn = nextStaffNumber(coaches);
    setLicenseTouched(false);
    setPendingPhoto(null);
    setPhotoPreviewUrl(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    setDraft(emptyDraft(sn, autoCoachLicense(sn)));
  }

  function onDialogOpenChange(next: boolean) {
    setOpen(next);
    if (next) resetFormForNewCoach();
  }

  function toggleCategory(c: Category) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c) ? d.categories.filter((x) => x !== c) : [...d.categories, c],
    }));
  }

  async function save() {
    if (saving) return;
    const coaches = useJscaStore.getState().clubCoaches;
    const staffNumber = draft.staffNumber?.trim() ? draft.staffNumber.trim() : nextStaffNumber(coaches);
    const licenseNumber = draft.licenseNumber?.trim()
      ? draft.licenseNumber.trim()
      : autoCoachLicense(staffNumber);

    setSaving(true);
    try {
      const created = await add({
        ...draft,
        staffNumber,
        licenseNumber,
        diploma: draft.diploma?.trim() || null,
        photoUrl: null,
      });
      if (!created) {
        toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde impossible." });
        return;
      }

      if (pendingPhoto) {
        const uploaded = await uploadClubCoachPhoto(created.id, pendingPhoto);
        if (!uploaded.ok) {
          toast.push({
            tone: "info",
            title: "Photo non enregistrée",
            description:
              uploaded.message ??
              "La fiche est enregistrée ; l’envoi de la photo a échoué. Réessayez depuis une future édition ou supprimez et recréez.",
          });
        } else {
          useJscaStore.setState((s) => ({
            clubCoaches: s.clubCoaches.map((c) => (c.id === created.id ? uploaded.coach : c)),
          }));
        }
        setPendingPhoto(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
      }

      toast.push({ tone: "success", title: "Enregistré", description: "Entraîneur sauvegardé." });
      setOpen(false);
      resetFormForNewCoach();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Entraîneurs"
        description="Encadrement technique : catégories encadrées, licence fédérale et diplôme — photo depuis l’appareil comme pour les sportifs."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/club/cartes-entraineurs">Impression cartes</Link>
            </Button>
            <Dialog open={open} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="size-4" /> Nouvel entraîneur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un entraîneur</DialogTitle>
                  <DialogDescription>
                    N° staff et licence proposés automatiquement (modifiables). Photo : fichier depuis le téléphone ou
                    l’ordinateur.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="coach-staff">N° staff</Label>
                    <Input
                      id="coach-staff"
                      value={draft.staffNumber}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraft((d) => {
                          if (licenseTouched) return { ...d, staffNumber: v };
                          const coaches = useJscaStore.getState().clubCoaches;
                          const forLic = v.trim() ? v : nextStaffNumber(coaches);
                          return { ...d, staffNumber: v, licenseNumber: autoCoachLicense(forLic) };
                        });
                      }}
                    />
                    <p className="text-[11px] text-muted-foreground">Attribué automatiquement ; vous pouvez le changer.</p>
                  </div>
                  <InputField
                    label="Date d’entrée"
                    type="date"
                    value={draft.joinDate}
                    onChange={(v) => setDraft({ ...draft, joinDate: v })}
                  />
                  <InputField label="Nom" value={draft.lastName} onChange={(v) => setDraft({ ...draft, lastName: v })} />
                  <InputField label="Prénom" value={draft.firstName} onChange={(v) => setDraft({ ...draft, firstName: v })} />
                  <InputField label="Téléphone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                  <InputField label="Email" type="email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="coach-license">Licence fédérale</Label>
                    <Input
                      id="coach-license"
                      value={draft.licenseNumber ?? ""}
                      onChange={(e) => {
                        setLicenseTouched(true);
                        setDraft({ ...draft, licenseNumber: e.target.value });
                      }}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Générée selon le N° staff ; modifiez librement si besoin.
                    </p>
                  </div>
                  <InputField label="Diplôme" value={draft.diploma ?? ""} onChange={(v) => setDraft({ ...draft, diploma: v })} />
                  <div className="sm:col-span-2 space-y-2 rounded-xl border border-dashed bg-muted/20 p-3">
                    <Label htmlFor="coach-photo" className="text-xs text-muted-foreground">
                      Photo (carte)
                    </Label>
                    <p className="text-[12px] text-muted-foreground">
                      Image depuis l’appareil (galerie ou appareil photo), enregistrée sur le serveur comme pour les
                      sportifs. JPG, PNG, WEBP, GIF — max. 4&nbsp;Mo.
                    </p>
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
                        {photoPreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- aperçu fichier local
                          <img src={photoPreviewUrl} alt="" className="h-40 w-32 object-cover" />
                        ) : (
                          <div className="flex h-40 w-32 items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
                            Aperçu
                          </div>
                        )}
                      </div>
                      <Input
                        ref={photoInputRef}
                        id="coach-photo"
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
                  <div className="sm:col-span-2 space-y-2 rounded-xl border border-dashed bg-muted/20 p-3">
                    <Label className="text-xs text-muted-foreground">Catégories encadrées</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleCategory(opt.value)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            draft.categories.includes(opt.value)
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-dashed bg-muted/20 p-3">
                    <input
                      id="coach-active"
                      type="checkbox"
                      className="size-4 accent-emerald-600"
                      checked={draft.active}
                      onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                    />
                    <Label htmlFor="coach-active" className="normal-case">
                      Actif pour impression carte
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="button" disabled={saving} onClick={save}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <DataTable<ClubCoach>
        rowKey={(r) => r.id}
        searchKeys={["staffNumber", "lastName", "firstName", "email", "phone", "licenseNumber", "diploma"]}
        data={rows}
        columns={[
          { key: "staffNumber", header: "N° staff" },
          { key: "lastName", header: "Nom" },
          { key: "firstName", header: "Prénom" },
          {
            key: "categories",
            header: "Catégories",
            render: (r) => <span className="text-xs">{categoryLabels(r.categories) || "—"}</span>,
          },
          { key: "phone", header: "Téléphone" },
          {
            key: "joinDate",
            header: "Entrée",
            render: (r) => formatDateFr(r.joinDate),
          },
          {
            key: "active",
            header: "Statut",
            render: (r) => (
              <button
                type="button"
                className="inline-flex"
                onClick={() => {
                  void update(r.id, { active: !r.active });
                }}
              >
                <Badge tone={r.active ? "green" : "amber"}>{r.active ? "Actif" : "Inactif"}</Badge>
              </button>
            ),
          },
          {
            key: "id",
            header: "",
            className: "w-[48px]",
            render: (r) => (
              <Button
                size="icon"
                variant="ghost"
                type="button"
                aria-label="Supprimer"
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

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
