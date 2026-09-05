"use client";

import { cn } from "@/lib/utils";

export interface ChipOption {
  label: string;
  value: string;
}

export function FilterChips({
  options,
  selected,
  onSelect,
  className,
}: {
  options: ChipOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex gap-2 overflow-x-auto",
        className
      )}
    >
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(active ? null : opt.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow"
                : "border border-border bg-white text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}