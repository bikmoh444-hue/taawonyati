// Fixed value sets + maps shared across the app.
// NOTE: mirrors the mobile app's constants exactly.

import type { DocumentType } from "./types";

export const DOCUMENT_PREFIX: Record<DocumentType, string> = {
  FAC: "FAC",
  BDL: "BDL",
  DEV: "DEV",
  BDC: "DOC",
};

// NOTE: replicates known gap from mobile app — BDC is never offered in the
// create-document UI, only DB/PDF capable. See spec §7.
export const CREATEABLE_DOCUMENT_TYPES: DocumentType[] = ["FAC", "DEV", "BDL"];

// Product category keys (stored as-is, labels localized for display).
export const PRODUCT_CATEGORIES = [
  "semences",
  "engrais",
  "equipement",
  "alimentation",
  "autre",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Expense categories (fixed Arabic strings — stored as-is).
export const EXPENSE_CATEGORIES = [
  "كراء",
  "كهرباء/ماء",
  "نقل",
  "أجور",
  "مواد أولية",
  "صيانة",
  "أخرى",
] as const;

// Income categories (fixed Arabic strings — stored as-is).
export const INCOME_CATEGORIES = [
  "مبيعات",
  "دعم/منح",
  "اشتراكات الأعضاء",
  "مداخيل أخرى",
] as const;

export const STORAGE_BUCKETS = {
  LOGOS: "company-logos",
  PRODUCT_PHOTOS: "product-photos",
  ACTIVITY_IMAGES: "activity_images",
  LANDING_MEDIA: "landing-media",
} as const;

export const DEFAULT_CURRENCY = "MAD";

// The amount-in-words spellout ends with this unit label (shares the same
// logic as the mobile app).
export const MONEY_UNIT = "DH";

export const PERIODS = ["day", "week", "month", "year"] as const;
export type PeriodKey = (typeof PERIODS)[number];

export const LOCALE_COOKIE = "taawoniati.locale";
export const DEFAULT_LOCALE = "ar";
export type AppLocale = "ar" | "fr";