"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Cooperative } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";

export function AdminCooperativesManager({
  cooperatives,
}: {
  cooperatives: Cooperative[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Cooperative | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cooperatives;
    return cooperatives.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.name_fr?.toLowerCase().includes(q) ||
        c.name_ar?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
    );
  }, [cooperatives, search]);

  async function remove() {
    if (!deleting) return;
    try {
      const res = await fetch("/api/admin/delete-cooperative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cooperativeId: deleting.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error ?? "failed");
      }
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy">{t("admin.accounts")}</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          {t("admin.createUser")}
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("admin.searchPlaceholder")}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-9 w-9" strokeWidth={1.5} />}
          message={t("admin.noCoops")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold text-navy">
                    {c.name_ar || c.name_fr || c.name || "—"}
                  </p>
                  {c.secteur && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.secteur}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-destructive transition-colors hover:bg-red-50"
                  onClick={() => setDeleting(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {c.address || "—"}
                </p>
                {c.phone && (
                  <p dir="ltr">{c.phone}</p>
                )}
                {c.email && <p dir="ltr">{c.email}</p>}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground/70">
                {t("common.date")}: {fmtDate(c.created_at, locale)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.deleteCoop")}
        description={t("admin.deleteCoopConfirm")}
        onConfirm={remove}
      />

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}