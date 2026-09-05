// Category → color/icon mapping mirroring `operationCategoryStyle` from the
// mobile app, keyed on the exact Arabic category strings.
import {
  BadgeCheck,
  Coins,
  HandCoins,
  Home,
  LucideIcon,
  MoreHorizontal,
  Package,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

export interface CategoryStyle {
  color: string; // tailwind bg class for the chip
  icon: LucideIcon;
}

export const EXPENSE_CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "كراء": { color: "bg-violet-100 text-violet-700", icon: Home },
  "كهرباء/ماء": { color: "bg-sky-100 text-sky-700", icon: Zap },
  "نقل": { color: "bg-amber-100 text-amber-700", icon: Truck },
  "أجور": { color: "bg-emerald-100 text-emerald-700", icon: Users },
  "مواد أولية": { color: "bg-orange-100 text-orange-700", icon: Package },
  "صيانة": { color: "bg-slate-200 text-slate-700", icon: Wrench },
  "أخرى": { color: "bg-slate-200 text-slate-600", icon: MoreHorizontal },
};

export const INCOME_CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "مبيعات": { color: "bg-teal-100 text-teal-700", icon: BadgeCheck },
  "دعم/منح": { color: "bg-blue-100 text-blue-700", icon: HandCoins },
  "اشتراكات الأعضاء": { color: "bg-indigo-100 text-indigo-700", icon: Users },
  "مداخيل أخرى": { color: "bg-slate-200 text-slate-600", icon: Coins },
};

export function expenseCategoryStyle(category: string): CategoryStyle {
  return (
    EXPENSE_CATEGORY_STYLES[category] ?? {
      color: "bg-slate-200 text-slate-600",
      icon: Coins,
    }
  );
}

export function incomeCategoryStyle(category: string): CategoryStyle {
  return (
    INCOME_CATEGORY_STYLES[category] ?? {
      color: "bg-slate-200 text-slate-600",
      icon: Coins,
    }
  );
}