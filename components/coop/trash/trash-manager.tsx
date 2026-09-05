"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Package, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DocumentWithClient, Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type Tab = "documents" | "products";

interface Target {
  tab: Tab;
  action: "restore" | "permanent";
  id: string;
  name: string;
}

export function TrashManager({
  documents,
  products,
}: {
  documents: DocumentWithClient[];
  products: Product[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("documents");
  const [target, setTarget] = useState<Target | null>(null);

  const docCount = documents.length;
  const prodCount = products.length;

  async function act() {
    if (!target) return;
    const { tab: kind, action, id } = target;
    try {
      if (action === "restore") {
        const table = kind === "documents" ? "documents" : "products";
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: null })
          .eq("id", id);
        if (error) throw error;
        toast.success(t("toasts.restored"));
      } else {
        const table = kind === "documents" ? "documents" : "products";
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        toast.success(t("toasts.deleted"));
      }
      setTarget(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="documents">
            {t("trash.documents")} ({docCount})
          </TabsTrigger>
          <TabsTrigger value="products">
            {t("trash.products")} ({prodCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "documents" ? (
        documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-9 w-9" strokeWidth={1.5} />}
            message={t("trash.empty")}
          />
        ) : (
          <div className="rounded-3xl bg-white shadow-sm">
            {documents.map((d, i) => (
              <div key={d.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy">{d.number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.clients?.name ?? "—"} · {t("trash.deletedAt")}:{" "}
                      {fmtDateTime(d.deleted_at, locale)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-primary"
                    onClick={() =>
                      setTarget({
                        tab: "documents",
                        action: "restore",
                        id: d.id,
                        name: d.number,
                      })
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive"
                    onClick={() =>
                      setTarget({
                        tab: "documents",
                        action: "permanent",
                        id: d.id,
                        name: d.number,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-9 w-9" strokeWidth={1.5} />}
          message={t("trash.empty")}
        />
      ) : (
        <div className="rounded-3xl bg-white shadow-sm">
          {products.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("trash.deletedAt")}: {fmtDateTime(p.deleted_at, locale)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-primary"
                  onClick={() =>
                    setTarget({
                      tab: "products",
                      action: "restore",
                      id: p.id,
                      name: p.name,
                    })
                  }
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive"
                  onClick={() =>
                    setTarget({
                      tab: "products",
                      action: "permanent",
                      id: p.id,
                      name: p.name,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={
          target?.action === "restore"
            ? t("trash.restore")
            : t("common.confirmDelete")
        }
        description={
          target?.action === "restore"
            ? t("trash.confirmRestore")
            : t("trash.confirmPermanent")
        }
        confirmLabel={
          target?.action === "restore" ? t("trash.restore") : undefined
        }
        onConfirm={act}
      />
    </div>
  );
}