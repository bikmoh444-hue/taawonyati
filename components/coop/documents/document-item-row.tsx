"use client";

import { useState } from "react";
import { Package, Plus, Trash2, X } from "lucide-react";
import type { DocumentType, Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { fmtMoney } from "@/lib/format";
import { itemSubtotal, DEFAULT_UNIT } from "@/lib/docs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface RowItem {
  id: string;
  productId: string | null;
  productRef: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
}

const UNITS = [
  "Pièce",
  "Boîte",
  "Carton",
  "kg",
  "g",
  "t",
  "m",
  "m²",
  "m³",
  "L",
  "Sac",
];

export function DocumentItemRow({
  item,
  index,
  docType,
  hasClient,
  products,
  readOnly,
  onUpdate,
  onRemove,
}: {
  item: RowItem;
  index: number;
  docType: DocumentType;
  hasClient: boolean;
  products: Product[];
  readOnly: boolean;
  onUpdate: (patch: Partial<RowItem>) => void;
  onRemove: () => void;
}) {
  const { t, locale } = useI18n();
  const [unitOpen, setUnitOpen] = useState(false);

  // Catalog mode only when a client is selected (mirrors mobile behaviour).
  const lookupProductMode = ["FAC", "DEV", "BDL"].includes(docType) && hasClient;
  const product = item.productId
    ? products.find((p) => p.id === item.productId) ?? null
    : null;
  const total = itemSubtotal(item);
  const isBee = product?.category === "alimentation";

  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        {lookupProductMode ? (
          product ? (
            <button
              type="button"
              onClick={() => onUpdate({ productId: null })}
              className="flex flex-1 items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/60 p-2 text-start"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                {product.photo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={product.photo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmtMoney(product.price, locale)}
                </p>
              </div>
              {isBee && (
                <Badge variant="danger">
                  {t("products.bioBadge")}
                </Badge>
              )}
              <X className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <ProductPicker
              products={products}
              onPick={(p) =>
                onUpdate({
                  productId: p.id,
                  productRef: p.name,
                  unitPrice: String(p.price),
                })
              }
            />
          )
        ) : (
          <Input
            value={item.productRef}
            disabled={readOnly}
            onChange={(e) => onUpdate({ productRef: e.target.value })}
            placeholder={t("docs.productRef")}
            className="flex-1"
          />
        )}
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mt-2">
        <Input
          value={item.description}
          disabled={readOnly}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={t("docs.description")}
          className="h-9 text-sm"
        />
      </div>

      <div className="mt-2 grid grid-cols-12 items-center gap-2">
        {unitOpen ? (
          <div className="col-span-12 grid grid-cols-3 gap-2 rounded-xl bg-soft p-2">
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  onUpdate({ unit: u });
                  setUnitOpen(false);
                }}
                className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-navy shadow-sm"
              >
                {u}
              </button>
            ))}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setUnitOpen(true)}
              disabled={readOnly}
              className="col-span-3 flex h-9 items-center justify-center rounded-xl border border-border bg-[#eef1f0] text-xs font-semibold text-navy"
            >
              {item.unit || DEFAULT_UNIT}
            </button>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              disabled={readOnly}
              value={item.quantity}
              onChange={(e) => onUpdate({ quantity: e.target.value })}
              placeholder={t("docs.quantity")}
              className="col-span-3 h-9 text-center"
              dir="ltr"
            />
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              disabled={readOnly}
              value={item.unitPrice}
              onChange={(e) => onUpdate({ unitPrice: e.target.value })}
              placeholder={t("docs.unitPrice")}
              className="col-span-3 h-9 text-center disabled:opacity-60"
              dir="ltr"
            />
            <div className="col-span-3 text-end text-sm font-bold text-navy">
              <span className="border-t-2 border-primary/30 pt-1" dir="ltr">
                {fmtMoney(total, locale)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductPicker({
  products,
  onPick,
}: {
  products: Product[];
  onPick: (p: Product) => void;
}) {
  const { t } = useI18n();
  if (products.length === 0) {
    return (
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-border bg-white p-1.5">
        <Package className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          {t("docs.noProducts")}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-white p-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-primary"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <select
        value=""
        onChange={(e) => {
          const id = e.target.value;
          const p = products.find((x) => x.id === id);
          if (p) onPick(p);
          e.target.value = "";
        }}
        className="w-full bg-transparent text-sm font-medium text-muted-foreground outline-none"
      >
        <option value="">{t("docs.selectProduct")}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}