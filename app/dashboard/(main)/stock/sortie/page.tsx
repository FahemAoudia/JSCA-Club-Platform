"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJscaStore } from "@/stores/use-jsca-store";

export default function StockSortiePage() {
  const stockItems = useJscaStore((s) => s.stockItems);
  const addMovement = useJscaStore((s) => s.addStockMovement);

  const [productId, setProductId] = React.useState(stockItems[0]?.id ?? "");
  const [quantity, setQuantity] = React.useState(1);
  const [beneficiary, setBeneficiary] = React.useState("");
  const [note, setNote] = React.useState("");

  function save() {
    if (!productId) return;
    addMovement({
      productId,
      type: "sortie",
      quantity,
      purchaseDate: null,
      source: "",
      beneficiary,
      note,
    });
    setNote("");
    setBeneficiary("");
  }

  React.useEffect(() => {
    setProductId((pid) => pid || stockItems[0]?.id || "");
  }, [stockItems]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sortie du matériel"
        description="Retrait automatique depuis le même stock global JSCA utilisé lors des réceptions."
      />
      <Card>
        <CardContent className="grid gap-4 p-8 md:grid-cols-2">
          <Field label="Produit JSCA disponible à la descente physique">
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {stockItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.quantity}&nbsp;{s.unit})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantité sortie sécurité">
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </Field>
          <Field label="Bénéficiaire officiel JSCA déclaré à la présidence" span>
            <Input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Coach U13 — séance mercredi" />
          </Field>
          <Field label="Note / lien dérogation président" span>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Décision officielle JSCA réf XYZ…" />
          </Field>
        </CardContent>
        <CardContent className="border-t border-border p-8">
          <Button type="button" onClick={save}>
            Enregistrer sortie
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
