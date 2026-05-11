"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  ACTUALITES_FIELD_GROUPS,
  LANDING_FIELD_GROUPS,
  type ActualitesCopy,
  type LandingCopy,
} from "@/lib/landing-merge";
import type { MediaItem, NewsItem } from "@/types";
import { id as newId } from "@/lib/utils";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/*";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type TabId =
  | "text-fr"
  | "text-ar"
  | "act-fr"
  | "act-ar"
  | "news"
  | "media"
  | "brand";

export default function PageAccueilSettingsPage() {
  const toast = useToast();
  const [tab, setTab] = React.useState<TabId>("text-fr");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [copyFr, setCopyFr] = React.useState<LandingCopy | null>(null);
  const [copyAr, setCopyAr] = React.useState<LandingCopy | null>(null);
  const [actualitesFr, setActualitesFr] = React.useState<ActualitesCopy | null>(null);
  const [actualitesAr, setActualitesAr] = React.useState<ActualitesCopy | null>(null);
  const [logoUrl, setLogoUrl] = React.useState("");
  const [bannerEmoji, setBannerEmoji] = React.useState("ⵣ");
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [media, setMedia] = React.useState<MediaItem[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, newsRes, mediaRes] = await Promise.all([
        fetch("/api/landing-page-settings", { credentials: "include" }),
        fetch("/api/news", { credentials: "include" }),
        fetch("/api/media", { credentials: "include" }),
      ]);
      const settingsJson = (await settingsRes.json().catch(() => null)) as {
        ok?: boolean;
        data?: {
          copyFr: LandingCopy;
          copyAr: LandingCopy;
          actualitesFr: ActualitesCopy;
          actualitesAr: ActualitesCopy;
          logoUrl: string;
          bannerEmoji: string;
        };
      } | null;
      const newsJson = (await newsRes.json().catch(() => null)) as { ok?: boolean; data?: NewsItem[] } | null;
      const mediaJson = (await mediaRes.json().catch(() => null)) as { ok?: boolean; data?: MediaItem[] } | null;

      if (!settingsRes.ok || !settingsJson?.ok || !settingsJson.data) throw new Error("settings");
      setCopyFr(settingsJson.data.copyFr);
      setCopyAr(settingsJson.data.copyAr);
      setActualitesFr(settingsJson.data.actualitesFr);
      setActualitesAr(settingsJson.data.actualitesAr);
      setLogoUrl(settingsJson.data.logoUrl);
      setBannerEmoji(settingsJson.data.bannerEmoji);

      if (newsRes.ok && newsJson?.ok && newsJson.data) setNews(newsJson.data);
      if (mediaRes.ok && mediaJson?.ok && mediaJson.data) setMedia(mediaJson.data);
    } catch {
      toast.push({
        tone: "error",
        title: "Chargement impossible",
        description: "Vérifiez la session admin et la base de données.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function saveLanding(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/landing-page-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !json?.ok) throw new Error("save");
      toast.push({ tone: "success", title: "Enregistré", description: "Contenu public mis à jour." });
      await load();
    } catch {
      toast.push({ tone: "error", title: "Erreur", description: "Sauvegarde refusée." });
    } finally {
      setSaving(false);
    }
  }

  function fieldForLanding(
    locale: "fr" | "ar",
    k: keyof LandingCopy,
    value: string,
    onChange: (v: string) => void,
  ) {
    const multiline = value.length > 90 || value.includes("\n");
    return (
      <div key={`${locale}-${String(k)}`} className="space-y-1">
        <Label className="font-mono text-[11px] text-muted-foreground">{String(k)}</Label>
        {multiline ? (
          <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="text-sm" />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
        )}
      </div>
    );
  }

  function fieldForActualites(
    locale: "fr" | "ar",
    k: keyof ActualitesCopy,
    value: string,
    onChange: (v: string) => void,
  ) {
    const multiline = value.length > 120 || value.includes("\n");
    return (
      <div key={`${locale}-act-${String(k)}`} className="space-y-1">
        <Label className="font-mono text-[11px] text-muted-foreground">{String(k)}</Label>
        {multiline ? (
          <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="text-sm" />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
        )}
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "text-fr", label: "Accueil · français" },
    { id: "text-ar", label: "Accueil · العربية" },
    { id: "act-fr", label: "Actualités · français" },
    { id: "act-ar", label: "Actualités · العربية" },
    { id: "news", label: "Articles (cartes)" },
    { id: "media", label: "Galerie médias" },
    { id: "brand", label: "Logo & en-tête" },
  ];

  if (loading || !copyFr || !copyAr || !actualitesFr || !actualitesAr) {
    return (
      <div className="space-y-6">
        <PageHeader title="Page d’accueil (site public)" description="Chargement…" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Page d’accueil (site public)"
        description="Textes bilingues, articles, galerie et logo affichés sur jsca.local / — les visiteurs lisent via /api/public/landing."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={saving}>
            Recharger
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant={tab === t.id ? "default" : "outline"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "text-fr" ? (
        <Card>
          <CardHeader>
            <CardTitle>Textes page d’accueil — français</CardTitle>
            <CardDescription>Enregistre la version complète des champs (fusion avec les défauts code si vous videz la base).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {LANDING_FIELD_GROUPS.map((g) => (
              <div key={g.label} className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{g.label}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.keys.map((k) =>
                    fieldForLanding("fr", k, copyFr[k], (v) => setCopyFr((c) => (c ? { ...c, [k]: v } : c))),
                  )}
                </div>
              </div>
            ))}
            <Button type="button" disabled={saving} onClick={() => void saveLanding({ copyFr })}>
              Enregistrer le français (accueil)
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "text-ar" ? (
        <Card>
          <CardHeader>
            <CardTitle>Textes page d’accueil — العربية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {LANDING_FIELD_GROUPS.map((g) => (
              <div key={g.label} className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{g.label}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.keys.map((k) =>
                    fieldForLanding("ar", k, copyAr[k], (v) => setCopyAr((c) => (c ? { ...c, [k]: v } : c))),
                  )}
                </div>
              </div>
            ))}
            <Button type="button" disabled={saving} onClick={() => void saveLanding({ copyAr })}>
              Enregistrer l’arabe (accueil)
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "act-fr" ? (
        <Card>
          <CardHeader>
            <CardTitle>Page /actualités — français</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {ACTUALITES_FIELD_GROUPS.map((g) => (
              <div key={g.label} className="space-y-4">
                <h3 className="text-sm font-semibold">{g.label}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.keys.map((k) =>
                    fieldForActualites("fr", k, actualitesFr[k], (v) =>
                      setActualitesFr((c) => (c ? { ...c, [k]: v } : c)),
                    ),
                  )}
                </div>
              </div>
            ))}
            <Button type="button" disabled={saving} onClick={() => void saveLanding({ actualitesFr })}>
              Enregistrer (FR actualités)
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "act-ar" ? (
        <Card>
          <CardHeader>
            <CardTitle>Page /actualités — العربية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {ACTUALITES_FIELD_GROUPS.map((g) => (
              <div key={g.label} className="space-y-4">
                <h3 className="text-sm font-semibold">{g.label}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.keys.map((k) =>
                    fieldForActualites("ar", k, actualitesAr[k], (v) =>
                      setActualitesAr((c) => (c ? { ...c, [k]: v } : c)),
                    ),
                  )}
                </div>
              </div>
            ))}
            <Button type="button" disabled={saving} onClick={() => void saveLanding({ actualitesAr })}>
              Enregistrer (AR actualités)
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "brand" ? (
        <Card>
          <CardHeader>
            <CardTitle>Logo & symbole bandeau</CardTitle>
            <CardDescription>
              Logo : choisissez une image sur cet ordinateur ou le téléphone (JPG, PNG, WEBP, GIF — max. 4&nbsp;Mo). Pas de
              lien à saisir.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-xl space-y-6">
            <div className="space-y-2">
              <Label>Logo actuel (aperçu)</Label>
              <div className="flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview any stored URL */}
                <img
                  src={logoUrl?.trim() || "/branding/jsca-logo.png"}
                  alt=""
                  className="size-20 rounded-full border border-border object-cover shadow-sm"
                />
                <div className="space-y-1">
                  <Input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="max-w-xs cursor-pointer"
                    disabled={saving}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      if (!IMAGE_TYPES.has(f.type)) {
                        toast.push({
                          tone: "error",
                          title: "Format refusé",
                          description: "Utilisez JPG, PNG, WEBP ou GIF.",
                        });
                        return;
                      }
                      setSaving(true);
                      try {
                        const fd = new FormData();
                        fd.append("file", f);
                        const res = await fetch("/api/uploads/landing-logo", {
                          method: "POST",
                          body: fd,
                          credentials: "include",
                        });
                        const json = (await res.json().catch(() => null)) as {
                          ok?: boolean;
                          message?: string;
                          data?: { logoUrl: string | null };
                        } | null;
                        if (!res.ok || !json?.ok || !json.data?.logoUrl) {
                          toast.push({
                            tone: "error",
                            title: "Échec envoi du logo",
                            description: json?.message ?? "Réessayez ou vérifiez le format.",
                          });
                          return;
                        }
                        setLogoUrl(json.data.logoUrl);
                        toast.push({ tone: "success", title: "Logo enregistré" });
                      } catch {
                        toast.push({
                          tone: "error",
                          title: "Échec envoi du logo",
                          description: "Erreur réseau.",
                        });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground">Enregistrement immédiat après choix du fichier.</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Caractère / emoji à côté du bandeau actus</Label>
              <Input value={bannerEmoji} onChange={(e) => setBannerEmoji(e.target.value)} className="max-w-[120px]" />
            </div>
            <Button type="button" disabled={saving} onClick={() => void saveLanding({ bannerEmoji })}>
              Enregistrer le symbole / emoji
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "news" ? (
        <Card>
          <CardHeader>
            <CardTitle>Articles (accueil & page actualités)</CardTitle>
            <CardDescription>Champs FR + AR pour titre, extrait et catégorie.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 max-h-[72vh] overflow-y-auto pr-2">
            {news.map((n) => (
              <div key={n.id} className="rounded-2xl border border-border p-4 space-y-3">
                <p className="text-xs font-mono text-muted-foreground">{n.id}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Titre FR</Label>
                    <Input value={n.title} onChange={(e) => setNews((x) => x.map((r) => (r.id === n.id ? { ...r, title: e.target.value } : r)))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Titre AR</Label>
                    <Input
                      value={n.titleAr ?? ""}
                      onChange={(e) =>
                        setNews((x) => x.map((r) => (r.id === n.id ? { ...r, titleAr: e.target.value } : r)))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Extrait FR</Label>
                    <Textarea
                      value={n.excerpt}
                      rows={2}
                      onChange={(e) =>
                        setNews((x) => x.map((r) => (r.id === n.id ? { ...r, excerpt: e.target.value } : r)))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Extrait AR</Label>
                    <Textarea
                      value={n.excerptAr ?? ""}
                      rows={2}
                      onChange={(e) =>
                        setNews((x) => x.map((r) => (r.id === n.id ? { ...r, excerptAr: e.target.value } : r)))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Date (AAAA-MM-JJ)</Label>
                    <Input value={n.date} onChange={(e) => setNews((x) => x.map((r) => (r.id === n.id ? { ...r, date: e.target.value } : r)))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Catégorie FR</Label>
                    <Input
                      value={n.category}
                      onChange={(e) =>
                        setNews((x) => x.map((r) => (r.id === n.id ? { ...r, category: e.target.value } : r)))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Catégorie AR</Label>
                    <Input
                      value={n.categoryAr ?? ""}
                      onChange={(e) =>
                        setNews((x) => x.map((r) => (r.id === n.id ? { ...r, categoryAr: e.target.value } : r)))
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/news/${n.id}`, {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            title: n.title,
                            titleAr: n.titleAr || null,
                            excerpt: n.excerpt,
                            excerptAr: n.excerptAr || null,
                            date: n.date,
                            category: n.category,
                            categoryAr: n.categoryAr || null,
                          }),
                        });
                        const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
                        if (!res.ok || !json?.ok) throw new Error("x");
                        toast.push({ tone: "success", title: "Article enregistré" });
                        await load();
                      } catch {
                        toast.push({ tone: "error", title: "Échec enregistrement" });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Enregistrer cet article
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={saving}
                    onClick={async () => {
                      if (!window.confirm("Supprimer cet article ?")) return;
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/news/${n.id}`, { method: "DELETE", credentials: "include" });
                        if (!res.ok) throw new Error("x");
                        setNews((x) => x.filter((r) => r.id !== n.id));
                        toast.push({ tone: "success", title: "Supprimé" });
                      } catch {
                        toast.push({ tone: "error", title: "Suppression impossible" });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
            <NewsCreateForm
              disabled={saving}
              onCreated={async () => {
                await load();
                toast.push({ tone: "success", title: "Article créé" });
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {tab === "media" ? (
        <Card>
          <CardHeader>
            <CardTitle>Galerie (images page d’accueil)</CardTitle>
            <CardDescription>
              Images uniquement : envoyez un fichier depuis l’appareil pour chaque visuel. Légendes FR / AR éditables
              séparément.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 max-h-[72vh] overflow-y-auto pr-2">
            {media.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border p-4 space-y-3">
                <p className="text-xs font-mono text-muted-foreground">{m.id}</p>
                <div className="flex flex-wrap gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img
                    src={m.type === "photo" ? m.src : m.thumb}
                    alt=""
                    className="h-28 w-40 rounded-lg border border-border object-cover"
                  />
                  <div className="grid flex-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Remplacer l’image (fichier)</Label>
                      <Input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        className="max-w-sm cursor-pointer"
                        disabled={saving}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (!f) return;
                          if (!IMAGE_TYPES.has(f.type)) {
                            toast.push({
                              tone: "error",
                              title: "Format refusé",
                              description: "Utilisez JPG, PNG, WEBP ou GIF.",
                            });
                            return;
                          }
                          setSaving(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", f);
                            const res = await fetch(`/api/media/${m.id}/image`, {
                              method: "POST",
                              body: fd,
                              credentials: "include",
                            });
                            const json = (await res.json().catch(() => null)) as {
                              ok?: boolean;
                              message?: string;
                              data?: MediaItem;
                            } | null;
                            if (!res.ok || !json?.ok || !json.data) {
                              toast.push({
                                tone: "error",
                                title: "Échec envoi de l’image",
                                description: json?.message ?? "Réessayez ou vérifiez le format.",
                              });
                              return;
                            }
                            setMedia((x) => x.map((r) => (r.id === m.id ? json.data! : r)));
                            toast.push({ tone: "success", title: "Image mise à jour" });
                            await load();
                          } catch {
                            toast.push({
                              tone: "error",
                              title: "Échec envoi de l’image",
                              description: "Erreur réseau.",
                            });
                          } finally {
                            setSaving(false);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Légende FR</Label>
                      <Input value={m.title} onChange={(e) => setMedia((x) => x.map((r) => (r.id === m.id ? { ...r, title: e.target.value } : r)))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Légende AR</Label>
                      <Input
                        value={m.titleAr ?? ""}
                        onChange={(e) =>
                          setMedia((x) => x.map((r) => (r.id === m.id ? { ...r, titleAr: e.target.value } : r)))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/media/${m.id}`, {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            title: m.title,
                            titleAr: m.titleAr || null,
                          }),
                        });
                        const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
                        if (!res.ok || !json?.ok) throw new Error("x");
                        toast.push({ tone: "success", title: "Légendes enregistrées" });
                        await load();
                      } catch {
                        toast.push({ tone: "error", title: "Échec enregistrement" });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Enregistrer les légendes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={saving}
                    onClick={async () => {
                      if (!window.confirm("Supprimer ce média ?")) return;
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/media/${m.id}`, { method: "DELETE", credentials: "include" });
                        if (!res.ok) throw new Error("x");
                        setMedia((x) => x.filter((r) => r.id !== m.id));
                        toast.push({ tone: "success", title: "Supprimé" });
                      } catch {
                        toast.push({ tone: "error", title: "Suppression impossible" });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
            <MediaCreateForm
              disabled={saving}
              onCreated={async () => {
                await load();
                toast.push({ tone: "success", title: "Média créé" });
              }}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function NewsCreateForm({ disabled, onCreated }: { disabled: boolean; onCreated: () => Promise<void> }) {
  const [title, setTitle] = React.useState("");
  const [titleAr, setTitleAr] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [excerptAr, setExcerptAr] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = React.useState("Vie du club");
  const [categoryAr, setCategoryAr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="rounded-2xl border border-dashed border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Nouvel article</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Titre FR</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Titre AR</Label>
          <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Extrait FR</Label>
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Extrait AR</Label>
          <Textarea value={excerptAr} onChange={(e) => setExcerptAr(e.target.value)} rows={2} />
        </div>
        <div className="space-y-1">
          <Label>Date</Label>
          <Input value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Catégorie FR</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Catégorie AR</Label>
          <Input value={categoryAr} onChange={(e) => setCategoryAr(e.target.value)} />
        </div>
      </div>
      <Button
        type="button"
        disabled={disabled || busy || !title.trim() || !excerpt.trim()}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch("/api/news", {
              method: "POST",
              credentials: "include",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: newId("nw"),
                title: title.trim(),
                titleAr: titleAr.trim() || null,
                excerpt: excerpt.trim(),
                excerptAr: excerptAr.trim() || null,
                date,
                category: category.trim(),
                categoryAr: categoryAr.trim() || null,
              }),
            });
            const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
            if (!res.ok || !json?.ok) throw new Error("x");
            setTitle("");
            setTitleAr("");
            setExcerpt("");
            setExcerptAr("");
            await onCreated();
          } finally {
            setBusy(false);
          }
        }}
      >
        Ajouter l’article
      </Button>
    </div>
  );
}

function MediaCreateForm({ disabled, onCreated }: { disabled: boolean; onCreated: () => Promise<void> }) {
  const toast = useToast();
  const [title, setTitle] = React.useState("");
  const [titleAr, setTitleAr] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="rounded-2xl border border-dashed border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Nouveau média (photo)</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Légende FR</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Légende AR</Label>
          <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Image (fichier)</Label>
          <Input
            type="file"
            accept={IMAGE_ACCEPT}
            className="max-w-sm cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <Button
        type="button"
        disabled={disabled || busy || !title.trim() || !file || !IMAGE_TYPES.has(file.type)}
        onClick={async () => {
          if (!file) return;
          setBusy(true);
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("title", title.trim());
            if (titleAr.trim()) fd.append("titleAr", titleAr.trim());
            const res = await fetch("/api/media/upload", {
              method: "POST",
              body: fd,
              credentials: "include",
            });
            const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
            if (!res.ok || !json?.ok) {
              toast.push({
                tone: "error",
                title: "Échec envoi du média",
                description: json?.message ?? "Réessayez ou vérifiez le format.",
              });
              return;
            }
            setTitle("");
            setTitleAr("");
            setFile(null);
            await onCreated();
          } catch {
            toast.push({
              tone: "error",
              title: "Échec envoi du média",
              description: "Erreur réseau.",
            });
          } finally {
            setBusy(false);
          }
        }}
      >
        Ajouter le média
      </Button>
    </div>
  );
}
