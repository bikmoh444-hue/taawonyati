// Document calculation helpers shared by the client form, edit page and the
// PDF generator. Mirrors the mobile app's rounding behaviour exactly
// (round2 at every step, `Pièce` default unit, delivery_fees forced to 0).

import { MONEY_UNIT } from "@/lib/constants";

export const DEFAULT_UNIT = "Pièce";

// Stored document columns that are always derived from live display fields,
// never typed directly by the user (matches mobile).
export const COMPUTED_FIELDS = [
  "discount",
  "tva_amount",
  "delivery_fees",
  "total",
] as const;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function moneyEq(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}

// Parse user-typed money into a number. Handles Arabic-Indic digits (٠-٩),
// Persian digits (۰-۹), both decimal separators and a trailing "DH" unit.
export function parseMoney(s: string | null | undefined): number | null {
  if (!s) return null;
  let t = String(s)
    .trim()
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));
  t = t
    // normalize decimal separator -> "."
    .replace(",", ".")
    // strip any stray symbols/letters (e.g. "$", "DH", spaces)
    .replace(/[^0-9.]/g, "");
  if (!t || !/^\d*\.?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export interface DocumentTotals {
  sub_total: number;
  discount_pct: number;
  discount: number;
  tva_rate: number;
  tva_amount: number;
  delivery_fees: number;
  deduction: number;
  total: number;
}

export interface ComputableDoc {
  discount_pct: string;
  tva_rate: string;
  tva_amount: string;
  delivery_fees: string;
}

export interface ComputableItem {
  quantity: string;
  // Database-style key (unit_price) or the client form's key (unitPrice).
  unit_price?: string;
  unitPrice?: string;
}

const field = (s: string | null | undefined): number => {
  const v = parseMoney(s);
  return v === null ? 0 : v;
};

export function computeDocument(
  doc: ComputableDoc,
  items: ComputableItem[]
): DocumentTotals {
  const sub_total = items.reduce((sum, it) => {
    // Default quantity to 1 when blank (matches mobile "Qty not parsed -> 1").
    const q = it.quantity.trim().length ? field(it.quantity) || 0 : 1;
    const up = field(it.unit_price ?? it.unitPrice);
    return sum + round2(q * up);
  }, 0);

  const discount_pct = field(doc.discount_pct);
  const discount = round2((sub_total * discount_pct) / 100);
  const tva_rate = field(doc.tva_rate);
  const tva_amount = field(doc.tva_amount);
  const delivery_fees = field(doc.delivery_fees);
  const deduction = round2(discount + tva_amount + delivery_fees);
  const total = round2(sub_total - deduction);

  return {
    sub_total,
    discount_pct,
    discount,
    tva_rate,
    tva_amount,
    delivery_fees,
    deduction,
    total,
  };
}

// "Arrêté à la somme de ... DH" — same string used on the PDF.
export function amountInWordsPrefix(): string {
  return MONEY_UNIT;
}

// Client-side item draft used by the create/edit form.
export interface ItemDraft {
  id: string;
  productId: string | null;
  productRef: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
}

export function newItem(): ItemDraft {
  return {
    id: crypto.randomUUID(),
    productId: null,
    productRef: "",
    description: "",
    unit: DEFAULT_UNIT,
    quantity: "1",
    unitPrice: "",
  };
}

export function blankItem(): ItemDraft {
  return newItem();
}

export function itemSubtotal(item: ItemDraft): number {
  const q = item.quantity.trim().length ? field(item.quantity) || 0 : 1;
  const up = field(item.unitPrice);
  return round2(q * up);
}