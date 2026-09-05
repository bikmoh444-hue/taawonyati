"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Fab({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95",
        className
      )}
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}