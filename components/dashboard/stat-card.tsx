import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "emerald" | "sky" | "violet" | "amber" | "green";
}) {
  const tone =
    accent === "emerald"
      ? "from-emerald-500/20 via-transparent to-transparent"
      : accent === "sky"
        ? "from-sky-500/20 via-transparent to-transparent"
        : accent === "violet"
          ? "from-violet-500/20 via-transparent to-transparent"
          : accent === "green"
            ? "from-green-500/20 via-transparent to-transparent"
            : "from-amber-500/22 via-transparent to-transparent";

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br", tone)} />
      <CardContent className="relative flex items-start gap-4 p-6">
        {icon ? (
          <div className="rounded-xl bg-muted px-3 py-2 text-card-foreground shadow-inner">{icon}</div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <div className="whitespace-nowrap text-[1.65rem] font-semibold tabular-nums tracking-tight text-card-foreground sm:text-[1.75rem]">
            {value}
          </div>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
