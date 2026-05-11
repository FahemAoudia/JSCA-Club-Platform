import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      tone: {
        slate: "border-border bg-muted text-card-foreground",
        green: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/55 dark:border-emerald-800 dark:text-emerald-200",
        amber: "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/55 dark:border-amber-800 dark:text-amber-100",
        red: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/45 dark:border-red-900 dark:text-red-200",
        violet: "border-violet-200 bg-violet-50 text-violet-800 dark:bg-violet-950/45 dark:border-violet-900 dark:text-violet-100",
        sky: "border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-950/45 dark:border-sky-900 dark:text-sky-100",
      },
    },
    defaultVariants: {
      tone: "slate",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}
