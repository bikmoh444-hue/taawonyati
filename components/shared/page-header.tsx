"use client";

import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function PageHeader({
  title,
  backHref,
  actions,
  className,
}: {
  title: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const { dir } = useI18n();
  return (
    <div className={cn("mb-6 flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        {backHref && (
          <Button asChild variant="outline" size="icon" className="rounded-full bg-white">
            <Link href={backHref}>
              <ChevronDown className={cn("h-5 w-5 -rotate-90", dir === "ltr" && "rotate-90")} />
            </Link>
          </Button>
        )}
        <h2 className="text-xl font-bold text-navy">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function NewButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4" />
      {children}
    </Button>
  );
}