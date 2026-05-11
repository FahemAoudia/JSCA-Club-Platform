"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useJscaStore } from "@/stores/use-jsca-store";
import { formatDateFr } from "@/lib/utils";

type ScanState = "idle" | "starting" | "running" | "unsupported" | "error";

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorLike = { detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]> };
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

function parsePlayerIdFromScan(raw: string) {
  try {
    const txt = raw.trim();
    if (!txt) return null;
    if (txt.startsWith("JSCA:")) return txt.slice("JSCA:".length);
    const url = new URL(txt);
    const match = url.pathname.match(/\/dashboard\/sportifs\/([^/]+)$/);
    return match?.[1] ?? null;
  } catch {
    const match = raw.match(/\/dashboard\/sportifs\/([^/]+)$/);
    return match?.[1] ?? null;
  }
}

export default function PresenceSeancePage() {
  const params = useParams<{ id: string }>();
  const trainingId = params.id;

  const trainings = useJscaStore((s) => s.trainings);
  const groups = useJscaStore((s) => s.sportGroups);
  const players = useJscaStore((s) => s.players);
  const attendances = useJscaStore((s) => s.trainingAttendances);
  const setAttendance = useJscaStore((s) => s.setTrainingAttendance);
  const resetAttendance = useJscaStore((s) => s.resetTrainingAttendance);

  const training = trainings.find((t) => t.id === trainingId);
  const group = training ? groups.find((g) => g.id === training.groupId) : null;

  const roster = React.useMemo(() => {
    if (!training) return [];
    return players
      .filter((p) => p.active && p.groupId === training.groupId)
      .slice()
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr"));
  }, [players, training]);

  const statusByPlayer = React.useMemo(() => {
    const map = new Map<string, "present" | "absent">();
    for (const a of attendances) {
      if (a.trainingId !== trainingId) continue;
      map.set(a.playerId, a.status);
    }
    return map;
  }, [attendances, trainingId]);

  const presentCount = roster.reduce((acc, p) => (statusByPlayer.get(p.id) === "present" ? acc + 1 : acc), 0);

  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((p) => `${p.lastName} ${p.firstName} ${p.sportNumber}`.toLowerCase().includes(q));
  }, [query, roster]);

  // QR scan (Chrome) via BarcodeDetector
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const detectorRef = React.useRef<BarcodeDetectorLike | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [scanState, setScanState] = React.useState<ScanState>("idle");
  const [scanError, setScanError] = React.useState<string | null>(null);

  const tickRef = React.useRef<(() => Promise<void>) | null>(null);

  const stopScan = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    detectorRef.current = null;
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
    }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanState("idle");
  }, []);

  React.useEffect(() => {
    tickRef.current = async () => {
      try {
        const video = videoRef.current;
        const detector = detectorRef.current;
        if (!video || !detector) return;
        if (video.readyState >= 2) {
          const codes = await detector.detect(video);
          if (codes?.length) {
            const raw = codes[0].rawValue ?? "";
            const playerId = parsePlayerIdFromScan(raw);
            if (playerId) setAttendance(trainingId, playerId, "present");
          }
        }
      } catch (e: unknown) {
        setScanError(String(e));
        setScanState("error");
        return;
      }
      rafRef.current = requestAnimationFrame(() => {
        void tickRef.current?.();
      });
    };
  }, [setAttendance, trainingId]);

  const startScan = React.useCallback(async () => {
    setScanError(null);
    if (typeof window === "undefined") return;
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!BarcodeDetector) {
      setScanState("unsupported");
      return;
    }
    setScanState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });
      setScanState("running");
      rafRef.current = requestAnimationFrame(() => {
        void tickRef.current?.();
      });
    } catch (e: unknown) {
      setScanError(String(e));
      setScanState("error");
    }
  }, []);

  React.useEffect(() => () => stopScan(), [stopScan]);

  if (!training) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Séance introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Présence séance"
        description={`${training.title} · ${group?.name ?? training.groupId} · ${formatDateFr(training.startAt)} — ${formatDateFr(training.endAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" type="button" onClick={() => resetAttendance(trainingId)}>
              Réinitialiser
            </Button>
            {scanState === "running" ? (
              <Button variant="outline" type="button" onClick={stopScan}>
                Arrêter scan QR
              </Button>
            ) : (
              <Button type="button" onClick={() => void startScan()}>
                Scan QR
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge tone="green">{presentCount} présents</Badge>
                <Badge tone="amber">{roster.length - presentCount} absents</Badge>
                <Badge tone="violet">{roster.length} total</Badge>
              </div>
              <div className="w-full sm:w-72">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un joueur…" />
              </div>
            </div>

            <div className="grid gap-2">
              {filtered.map((p) => {
                const status = statusByPlayer.get(p.id) ?? "absent";
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAttendance(trainingId, p.id, status === "present" ? "absent" : "present")}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">N° {p.sportNumber || "—"}</div>
                    </div>
                    <Badge tone={status === "present" ? "green" : "amber"}>{status === "present" ? "présent" : "absent"}</Badge>
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Aucun joueur trouvé.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="text-sm font-semibold">Scan QR (optionnel)</div>
            <div className="rounded-xl border border-dashed border-border bg-muted/15 p-3">
              {scanState === "unsupported" ? (
                <div className="text-sm text-muted-foreground">
                  Le scan QR n’est pas supporté sur ce navigateur. Utilise Chrome (desktop) ou un mobile récent.
                </div>
              ) : scanState === "error" ? (
                <div className="text-sm text-muted-foreground">Erreur scan: {scanError ?? "—"}</div>
              ) : (
                <div className="space-y-2">
                  <video ref={videoRef} className="aspect-video w-full rounded-lg bg-black/10" muted playsInline />
                  <div className="text-xs text-muted-foreground">
                    Scanne le QR sur la carte du joueur : la présence est ajoutée automatiquement.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

