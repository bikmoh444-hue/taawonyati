"use client";

import { useRouter } from "next/navigation";
import { Plus, TrendingUp } from "lucide-react";
import type { Cooperative } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function AdminDashboard({
  cooperatives,
  revenue,
}: {
  cooperatives: Cooperative[];
  revenue: number;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">{t("admin.greeting")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-navy p-5 text-white">
          <p className="text-sm text-white/70">{t("admin.totalCoops")}</p>
          <p className="mt-1 text-3xl font-extrabold">{cooperatives.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {t("admin.revenue")}
          </p>
          <p className="mt-1 text-3xl font-extrabold text-primary" dir="ltr">
            {revenue.toFixed(2)} DH
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t("admin.revenueNote")}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-bold text-navy">{t("admin.recentCoops")}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => router.push("/admin/cooperatives")}
          >
            {t("admin.manage")}
          </Button>
        </div>
        {cooperatives.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("admin.noCoops")}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {cooperatives.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push("/admin/cooperatives")}
                className="w-full rounded-2xl border border-border/60 bg-soft/50 p-3 text-start transition-colors hover:bg-soft"
              >
                <p className="truncate font-semibold text-navy">
                  {c.name_ar || c.name_fr || c.name || "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.address || c.email || "—"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {fmtDateTime(c.created_at, locale)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button type="button" onClick={() => router.push("/admin/cooperatives")}>
        <Plus className="h-4 w-4" />
        {t("admin.addCooperative")}
      </Button>
    </div>
  );
}