"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyLabel?: string;
  rowKey: (row: T) => string;
};

export function DataTable<T extends object>({
  columns,
  data,
  searchKeys,
  pageSize = 8,
  emptyLabel = "Aucun enregistrement pour le moment.",
  rowKey,
}: DataTableProps<T>) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return data;
    return data.filter((row) => {
      const keys = searchKeys?.length
        ? searchKeys
        : (Object.keys(row as object) as (keyof T)[]);
      return keys.some((k) => {
        const v = row[k];
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(query);
      });
    });
  }, [data, q, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  React.useEffect(() => {
    setPage(0);
  }, [q, data.length]);

  React.useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const slice = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9"
            />
          </div>
          <div className="text-xs text-muted-foreground">{filtered.length} résultats</div>
        </div>
        <div className="scrollbar-thin -mx-1 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    className={cn("sticky top-0 z-10 bg-card px-3 py-3", c.className)}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={columns.length}>
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                slice.map((row) => (
                  <tr key={rowKey(row)} className="border-t border-border text-sm hover:bg-muted/40">
                    {columns.map((c) => (
                      <td key={String(c.key)} className={cn("px-3 py-3 align-middle", c.className)}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > pageSize ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold">{page + 1}</span> / {totalPages}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage(0)}
                aria-label="Première page"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Page précédente"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Page suivante"
              >
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage(totalPages - 1)}
                aria-label="Dernière page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
