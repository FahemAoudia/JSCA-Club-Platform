"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function StockReceptionPage() {
  const stockItems = useJscaStore((s) => s.stockItems);
  const addMovement = useJscaStore((s) => s.addStockMovement);

  const [productId, setProductId] = React.useState(stockItems[0]?.id ?? "");
  const [quantity, setQuantity] = React.useState(1);
  const [purchaseDate, setPurchaseDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = React.useState("");
  const [note, setNote] = React.useState("");

  function save() {
    if (!productId) return;
    addMovement({
      productId,
      type: "reception",
      quantity,
      purchaseDate,
      source,
      beneficiary: "",
      note,
    });
    setNote("");
  }

  React.useEffect(() => {
    setProductId((pid) => pid || stockItems[0]?.id || "");
  }, [stockItems]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Réception du matériel"
        description="Entrées physiques automatiquement recalculant le stock JSCA depuis la base locale mémoire."
      />
      <Card>
        <CardContent className="grid gap-4 p-8 md:grid-cols-2">
          <Field label="Produit">
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {stockItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantité">
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </Field>
          <Field label="Date d’achat / réception">
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </Field>
          <Field label="Source / fournisseur">
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Décathlon Alger — exemple" />
          </Field>
          <Field label="Observations livraisons" span>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Réf bon de livraison, transport…" />
          </Field>
        </CardContent>
        <CardContent className="border-t border-border p-8">
          <Button type="button" onClick={save}>
            Valider mouvement de réception
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${span ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
