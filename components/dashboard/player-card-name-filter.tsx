"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PlayerCardNameFilter({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filtrer par nom…"
        className="h-9 bg-card pl-9 pr-9"
        aria-label="Filtrer les cartes par nom de joueur"
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => onChange("")}
          aria-label="Effacer le filtre"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export function filterPlayersByName<
  T extends { lastName: string; firstName: string; licenseNumber?: string | null },
>(players: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return players;
  return players.filter((p) => {
    const full = `${p.lastName} ${p.firstName}`.toLowerCase();
    const reversed = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      full.includes(q) ||
      reversed.includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.firstName.toLowerCase().includes(q) ||
      (p.licenseNumber?.trim().toLowerCase().includes(q) ?? false)
    );
  });
}
