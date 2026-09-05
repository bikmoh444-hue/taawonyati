"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type {
  Client,
  Product,
  Cooperative,
  DocumentType,
  DocumentWithItems,
} from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, composeDocumentNumber } from "@/lib/format";
import {
  computeDocument,
  parseMoney,
  round2,
  newItem,
  DEFAULT_UNIT,
  type ItemDraft,
} from "@/lib/docs";
import { toFrenchWords, toArabicWords } from "@/lib/numbers/amount-to-words";
import { DocumentItemRow } from "@/components/coop/documents/document-item-row";
import { SectionHeading } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PAYMENT_METHODS = [
  "Espèces",
  "Chèque",
  "Virement bancaire",
  "Carte bancaire",
  "Autre",
];

const TYPE_OPTIONS: { value: DocumentType; labelKey: string }[] = [
  { value: "FAC", labelKey: "docs.invoice" },
  { value: "DEV", labelKey: "docs.devis" },
  { value: "BDL", labelKey: "docs.deliveryNote" },
];

interface DocFields {
  type: DocumentType | null;
  date: string;
  clientId: string | null;
  supplierId: string | null;
  number: string;
  name: string;
  discountPct: string;
  tvaRate: string;
  tvaAmountDisplay: string;
  paymentMethod: string;
  deliveryLocation: string;
  notes: string;
}

export function DocumentForm({
  cooperative,
  clients,
  products,
  initial,
  docCounts,
}: {
  cooperative: Cooperative;
  clients: Client[];
  products: Product[];
  initial?: DocumentWithItems | null;
  docCounts?: Record<string, number>;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const nextNumber = (type: DocumentType) =>
    composeDocumentNumber(type, (docCounts?.[type] ?? 0) + 1);

  const [fields, setFields] = useState<DocFields>(() => {
    if (initial) {
      return {
        type: initial.type,
        date: initial.date ? initial.date.slice(0, 10) : todayISO(),
        clientId: initial.client_id,
        supplierId: initial.supplier_id,
        number: initial.number,
        name: initial.name ?? "",
        discountPct: String(initial.discount ?? "0"),
        tvaRate: String(initial.tva_rate ?? "0"),
        tvaAmountDisplay: String(initial.tva_amount ?? "0"),
        paymentMethod: initial.payment_method ?? "",
        deliveryLocation: initial.delivery_location ?? "",
        notes: initial.notes ?? "",
      };
    }
    return {
      type: null,
      date: todayISO(),
      clientId: null,
      supplierId: null,
      number: nextNumber("FAC"),
      name: "",
      discountPct: "0",
      tvaRate: "0",
      tvaAmountDisplay: "0",
      paymentMethod: "",
      deliveryLocation: "",
      notes: "",
    };
  });

  const [items, setItems] = useState<ItemDraft[]>(() => {
    if (initial) {
      return initial.document_items.map((it) => ({
        id: crypto.randomUUID(),
        productId: it.product_id,
        productRef: it.product_ref ?? "",
        description: it.description ?? "",
        unit: it.unit ?? DEFAULT_UNIT,
        quantity: String(it.quantity ?? "1"),
        unitPrice: String(it.unit_price ?? "0"),
      }));
    }
    return [newItem()];
  });

  const docType: DocumentType = fields.type ?? "FAC";
  const hasClient = !!fields.clientId;
  const lookupMode = ["FAC", "DEV", "BDL"].includes(docType) && hasClient;
  const isBDL = docType === "BDL";
  const isDEV = docType === "DEV";
  const isBDC = docType === "BDC";

  // Live totals (unrounded quantities, matches mobile display).
  const totals = useMemo(
    () =>
      computeDocument(
        {
          discount_pct: fields.discountPct,
          tva_rate: fields.tvaRate,
          tva_amount: fields.tvaAmountDisplay,
          delivery_fees: "0",
        },
        items
      ),
    [fields.discountPct, fields.tvaRate, fields.tvaAmountDisplay, items]
  );

  const words = useMemo(
    () =>
      locale === "ar"
        ? toArabicWords(totals.total)
        : toFrenchWords(totals.total),
    [locale, totals.total]
  );

  function set(patch: Partial<DocFields>) {
    setFields((f) => ({ ...f, ...patch }));
  }

  function updateItem(id: string, patch: Partial<ItemDraft>) {
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function removeItem(id: string) {
    setItems((list) => list.filter((it) => it.id !== id));
  }

  function addItem() {
    setItems((list) => [...list, newItem()]);
  }

  async function save() {
    if (!fields.type) {
      toast.error(t("docs.selectType"));
      return;
    }
    if (["FAC", "DEV", "BDL"].includes(docType) && !fields.clientId) {
      toast.error(t("docs.clientRequired"));
      return;
    }
    if (items.length === 0) {
      toast.error(t("docs.atLeastOneItem"));
      return;
    }
    for (const it of items) {
      if (!it.productRef.trim()) {
        toast.error(t("docs.refRequired"));
        return;
      }
      const q = parseMoney(it.quantity);
      const up = parseMoney(it.unitPrice);
      if (q === null || q <= 0) {
        toast.error(t("docs.qtyInvalid"));
        return;
      }
      if (up === null || up < 0) {
        toast.error(t("docs.priceInvalid"));
        return;
      }
    }

    // Recompute totals from the ROUNDED (integer) quantities we actually store,
    // so the stored `total` stays coherent with the saved rows.
    const roundedItems = items.map((it) => ({
      ...it,
      quantity: String(parseMoney(it.quantity)),
      unitPrice: String(parseMoney(it.unitPrice)),
    }));
    const calcs = computeDocument(
      {
        discount_pct: fields.discountPct,
        tva_rate: fields.tvaRate,
        tva_amount: fields.tvaAmountDisplay,
        delivery_fees: "0",
      },
      roundedItems
    );

    const payload = {
      type: docType,
      number: fields.number.trim(),
      client_id: ["FAC", "DEV", "BDL"].includes(docType)
        ? fields.clientId
        : null,
      supplier_id: null,
      date: fields.date,
      status: "draft",
      is_paid: false,
      notes: fields.notes.trim() || null,
      name: isDEV ? (fields.name.trim() || null) : null,
      discount: calcs.discount,
      tva_rate: calcs.tva_rate,
      tva_amount: calcs.tva_amount,
      delivery_fees: 0,
      delivery_location: isBDL && fields.deliveryLocation.trim()
        ? fields.deliveryLocation.trim()
        : null,
      payment_method: fields.paymentMethod || null,
      total: calcs.total,
    };

    const itemsPayload = roundedItems.map((it) => ({
      product_id: it.productId,
      product_ref: it.productRef.trim() || null,
      description: it.description.trim() || null,
      unit: it.unit.trim() || DEFAULT_UNIT,
      quantity: Math.round(Math.max(0, parseMoney(it.quantity) ?? 0)),
      unit_price: round2(parseMoney(it.unitPrice) ?? 0),
    }));

    if (initial) {
      const { error: docErr } = await supabase
        .from("documents")
        .update(payload)
        .eq("id", initial.id);
      if (docErr) {
        console.error(docErr);
        toast.error(t("toasts.error"));
        return;
      }
      const { error: delErr } = await supabase
        .from("document_items")
        .delete()
        .eq("document_id", initial.id);
      if (delErr) {
        console.error(delErr);
        toast.error(t("toasts.error"));
        return;
      }
      const { error: insErr } = await supabase
        .from("document_items")
        .insert(
          itemsPayload.map((it) => ({
            document_id: initial.id,
            ...it,
          }))
        );
      if (insErr) {
        console.error(insErr);
        toast.error(t("toasts.error"));
        return;
      }
    } else {
      const { data: inserted, error: docErr } = await supabase
        .from("documents")
        .insert({ ...payload, cooperative_id: cooperative.id })
        .select("id")
        .single();
      if (docErr) {
        console.error(docErr);
        toast.error(t("toasts.error"));
        return;
      }
      const { error: insErr } = await supabase
        .from("document_items")
        .insert(
          itemsPayload.map((it) => ({
            document_id: inserted!.id,
            ...it,
          }))
        );
      if (insErr) {
        console.error(insErr);
        toast.error(t("toasts.error"));
        return;
      }
    }

    toast.success(t("toasts.saved"));
    router.push("/documents");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Type + client + number + date */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{initial ? t("docs.editTitle") : t("docs.newDocument")}</SectionHeading>
        <Separator className="my-4" />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("docs.typeLabel")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const active = docType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set({ type: opt.value })}
                    className={
                      active
                        ? "rounded-2xl border-2 border-primary bg-primary/5 py-3 text-center text-xs font-bold text-primary transition-colors"
                        : "rounded-2xl border-2 border-border py-3 text-center text-xs font-bold text-muted-foreground transition-colors"
                    }
                  >
                    {t(opt.labelKey as never)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("docs.number")}</Label>
            <Input
              value={fields.number}
              onChange={(e) => set({ number: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("docs.date")}</Label>
            <Input
              type="date"
              value={fields.date}
              onChange={(e) => set({ date: e.target.value })}
              className="h-11"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>{isBDC ? t("docs.toSupplier") : t("docs.client")}</Label>
          <select
            value={fields.clientId ?? ""}
            onChange={(e) => set({ clientId: e.target.value || null })}
            className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-[#eef1f0] px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("docs.selectionClient")}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {isDEV && (
          <div className="mt-4 space-y-2">
            <Label>{t("docs.name")}</Label>
            <Input
              value={fields.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder={t("docs.name")}
            />
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{t("docs.items")}</SectionHeading>
        <Separator className="my-4" />
        <div className="space-y-3">
          {items.map((it, idx) => (
            <DocumentItemRow
              key={it.id}
              item={it}
              index={idx}
              docType={docType}
              hasClient={hasClient}
              products={products}
              readOnly={false}
              onUpdate={(patch) => updateItem(it.id, patch)}
              onRemove={() => removeItem(it.id)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="mt-4"
        >
          <Plus className="h-4 w-4" />
          {t("docs.addItem")}
        </Button>
      </div>

      {/* Totals + payment details */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("docs.discountLabel")}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={fields.discountPct}
              onChange={(e) => set({ discountPct: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("docs.tvaLabel")}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={fields.tvaRate}
              onChange={(e) => set({ tvaRate: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("docs.paymentMethod")}</Label>
            <select
              value={fields.paymentMethod}
              onChange={(e) => set({ paymentMethod: e.target.value })}
              className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-[#eef1f0] px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">—</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          {isBDL && (
            <div className="space-y-2">
              <Label>{t("docs.deliveryLocation")}</Label>
              <Input
                value={fields.deliveryLocation}
                onChange={(e) => set({ deliveryLocation: e.target.value })}
              />
            </div>
          )}
        </div>

        <Separator className="my-5" />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{t("docs.itemTotal")}</span>
            <span dir="ltr">{fmtMoney(totals.sub_total, locale)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{t("docs.discountLabel")}</span>
            <span dir="ltr">
              - {fmtMoney(totals.discount, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{t("docs.tvaLabel")}</span>
            <span dir="ltr">{fmtMoney(totals.tva_amount, locale)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="font-bold">{t("docs.total")}</span>
            <span className="text-xl font-extrabold" dir="ltr">
              {fmtMoney(totals.total, locale)}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/70">
            {t("docs.arrivesTo")}: {words} {locale === "ar" ? "درهم" : "dirhams"}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label>{t("docs.notesAdditional")}</Label>
          <Textarea
            value={fields.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={4}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
          <Button type="button" size="lg" onClick={save}>
            {t("docs.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}