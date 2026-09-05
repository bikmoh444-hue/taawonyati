import type { AppLocale } from "@/lib/constants";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { tt } from "@/lib/i18n";

// Localized label for the fixed product category keys.
export function productCategoryLabel(category: string | null, locale: AppLocale): string {
  const key = PRODUCT_CATEGORIES.includes(category as never)
    ? category!
    : "autre";
  return tt(locale, `categories.${key}` as never);
}