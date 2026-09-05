"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({
  value,
  onChange,
  placeholder,
  onFilterClick,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t("common.search")}
          className="pe-12"
        />
        <Search className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </div>
      {onFilterClick && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="h-12 w-12 rounded-full bg-white"
        >
          <SlidersHorizontal className="h-5 w-5 text-primary" />
        </Button>
      )}
    </div>
  );
}