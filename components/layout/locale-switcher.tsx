"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  const next = locale === "ar" ? "fr" : "ar";

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "default"}
      className="gap-1.5 rounded-full bg-white font-bold text-navy shadow-sm"
      onClick={() => setLocale(next)}
      title={t("common.language")}
    >
      <Languages className="h-4 w-4" />
      {!compact && <span>{next.toUpperCase()}</span>}
    </Button>
  );
}