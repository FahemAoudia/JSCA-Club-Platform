"use client";

import Link from "next/link";

import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateFr } from "@/lib/utils";
import { useJscaStore } from "@/stores/use-jsca-store";
import type { StockItem, StockMovement } from "@/types";

export default function StockConsultationPage() {
  const stockItems = useJscaStore((s) => s.stockItems);
  const movements = useJscaStore((s) => s.stockMovements);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Consultation stocks JSCA temps réels"
        description="Alertes seuils et historique mouvements connectés automatiquement."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/stock/reception">Réceptions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/stock/sortie">Sorties</Link>
            </Button>
          </div>
        }
      />

      <DataTable<StockItem>
        rowKey={(r) => r.id}
        data={stockItems}
        searchKeys={["name"]}
        columns={[
          { key: "name", header: "Produit" },
          { key: "quantity", header: "Stock disponible", render: (r) => <span className="font-semibold">{r.quantity}</span> },
          { key: "unit", header: "Unité" },
          {
            key: "alertThreshold",
            header: "Seuil JSCA conseillé",
            render: (r) =>
              r.quantity <= r.alertThreshold ? (
                <Badge tone="red">Réappro critique</Badge>
              ) : (
                <Badge tone="green">OK</Badge>
              ),
          },
        ]}
      />

      <DataTable<StockMovement>
        rowKey={(r) => r.id}
        data={[...movements].sort((a, b) => (a.id < b.id ? 1 : -1))}
        searchKeys={["note", "source", "beneficiary"]}
        columns={[
          {
            key: "type",
            header: "Mouvement",
            render: (r) => (
              <Badge tone={r.type === "reception" ? "green" : "amber"}>{r.type}</Badge>
            ),
          },
          {
            key: "productId",
            header: "Produit",
            render: (r) => stockItems.find((p) => p.id === r.productId)?.name ?? "—",
          },
          {
            key: "quantity",
            header: "Qté impact",
            render: (r) => `${r.type === "reception" ? "+" : "-"}${r.quantity}`,
          },
          {
            key: "purchaseDate",
            header: "Date achat réception interne JSCA si applicable",
            render: (r) => (r.purchaseDate ? formatDateFr(r.purchaseDate) : "—"),
          },
          { key: "source", header: "Source" },
          { key: "beneficiary", header: "Bénéficiaire" },
          { key: "note", header: "Note" },
        ]}
      />
    </div>
  );
}
