import type { AppLocale } from "@/lib/constants";
import type { DocumentType } from "@/lib/types";
import { DOCUMENT_PREFIX } from "@/lib/constants";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function fmtMoney(n: number | string, locale: AppLocale = "fr"): string {
  const value = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(value)) return "--";
  const formatted = formatDecimal(value);
  return locale === "ar" ? `${formatted} د.م.` : `${formatted} DH`;
}

export function fmtMoneyRaw(n: number | string): string {
  const value = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(value)) return "--";
  return formatDecimal(value);
}

function formatDecimal(value: number): string {
  const rounded = round2(value);
  const [intPart, decPart] = rounded.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (decPart === "00") return grouped;
  return `${grouped},${decPart}`;
}

export function fmtDate(
  value: string | Date | null | undefined,
  locale: AppLocale = "fr"
): string {
  if (!value) return "--";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function fmtDateTime(
  value: string | Date | null | undefined,
  locale: AppLocale = "fr"
): string {
  if (!value) return "--";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function fmtDateLong(
  value: string | Date | null | undefined,
  locale: AppLocale = "fr"
): string {
  if (!value) return "--";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function monthLabel(value: string | Date, locale: AppLocale): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    month: "short",
    year: "numeric",
  }).format(d);
}

// Normalize a Moroccan phone: strips leading 0, ensures +212 prefix.
// NOTE: mirrors the mobile app's "+212 prefix handling".
export function normalizeMarocPhone(input: string): string {
  let cleaned = input.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+212")) return cleaned;
  if (cleaned.startsWith("00212")) return "+212" + cleaned.slice(5);
  if (cleaned.startsWith("212")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+212" + cleaned.slice(1);
  return "+212" + cleaned;
}

export const EMAIL_REGEX =
  /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

export function zeroPad(n: number, size: number): string {
  return String(n).padStart(size, "0");
}

// Next document number: counts ALL documents of the type for the cooperative
// INCLUDING soft-deleted (replicates the mobile generator, incl. its number
// "skips"). See spec §4.2 + §7.
export function composeDocumentNumber(
  type: DocumentType,
  count: number
): string {
  return `${DOCUMENT_PREFIX[type]}-${zeroPad(count, 3)}`;
}