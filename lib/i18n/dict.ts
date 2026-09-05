import { arDict, type Dictionary } from "./ar";
import { fr } from "./fr";
import type { AppLocale } from "@/lib/constants";

export type TKey = string;

const DICTS: Record<AppLocale, Dictionary> = {
  ar: arDict,
  fr,
};

function resolveKey(dict: Dictionary, key: string): string {
  const [section, sub] = key.split(".");
  const val = (dict as Record<string, Record<string, unknown>>)[section]?.[sub];
  return typeof val === "string" ? val : key;
}

export function tt(locale: AppLocale, key: TKey): string {
  return resolveKey(DICTS[locale], key);
}

export function getLocaleDir(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
