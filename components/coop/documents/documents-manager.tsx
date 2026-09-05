"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ClipboardList,
  FileClock,
  FilePlus2,
  FileText,
  FileX,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { DocumentType, DocumentWithClient } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, fmtDate } from "@/lib/format";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Fab } from "@/components/shared/fab";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function typeConfig(type: DocumentType) {
  switch (type) {
    case "FAC":
      return { icon: FileText, label: "docs.invoice", color: "bg-teal-50 text-teal-700" };
    case "DEV":
      return { icon: FileClock, label: "docs.devis", color: "bg-blue-50 text-blue-700" };
    case "BDL":
      return { icon: ClipboardList, label: "docs.deliveryNote", color: "bg-orange-50 text-orange-700" };
    default:
      return { icon: FilePlus2, label: "docs.purchaseOrder", color: "bg-purple-50 text-purple-700" };
  }
}

type Tab = "all" | "paid" | "unpaid";

export function DocumentsManager({
  documents,
}: {
  documents: DocumentWithClient[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [deleting, setDeleting] = useState<DocumentWithClient | null>(null);

  const hasFAC = documents.some((d) => d.type === "FAC");
  const counts = useMemo(() => {
    const fac = documents.filter((d) => d.type === "FAC");
    return {
      paid: fac.filter((d) => d.is_paid).length,
      unpaid: fac.filter((d) => !d.is_paid).length,
    };
  }, [documents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (q) {
        const hay = `${d.number} ${d.clients?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (tab === "paid") return d.type === "FAC" && d.is_paid;
      if (tab === "unpaid") return d.type === "FAC" && !d.is_paid;
      return true;
    });
  }, [documents, search, tab]);

  async function togglePaid(d: DocumentWithClient) {
    const { error } = await supabase
      .from("documents")
      .update({ is_paid: !d.is_paid })
      .eq("id", d.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.saved"));
    router.refresh();
  }

  async function softDelete(d: DocumentWithClient) {
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", d.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.deleted"));
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("docs.searchPlaceholder")}
      />

      {hasFAC && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="all">{t("docs.tabs.all")}</TabsTrigger>
            <TabsTrigger value="paid">
              {t("docs.tabs.paid")} ({counts.paid})
            </TabsTrigger>
            <TabsTrigger value="unpaid">
              {t("docs.tabs.unpaid")} ({counts.unpaid})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {hasFAC && tab !== "all" && (
        <p className="text-xs font-medium text-muted-foreground">
          {t("docs.paidFilterNote")}
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileX className="h-9 w-9" strokeWidth={1.5} />}
          message={t("docs.empty")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const cfg = typeConfig(d.type);
            const Icon = cfg.icon;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => router.push(`/documents/${d.id}`)}
                className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-start shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${cfg.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy">{d.number}</p>
                    <Badge variant="outline">{t(cfg.label as never)}</Badge>
                    {d.type === "FAC" && (
                      <Badge variant={d.is_paid ? "success" : "warning"}>
                        {d.is_paid
                          ? t("docs.paidBadge")
                          : t("docs.unpaidBadge")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {d.clients?.name ?? t("docs.selectType")}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="font-bold text-primary" dir="ltr">
                    {fmtMoney(d.total, "fr")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(d.date, "fr")}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-soft"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      onClick={() => router.push(`/documents/${d.id}`)}
                    >
                      {t("common.open")}
                    </DropdownMenuItem>
                    {d.type === "FAC" && (
                      <DropdownMenuItem onClick={() => togglePaid(d)}>
                        {t("docs.togglePaid")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleting(d)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={t("common.confirmDeleteMessage")}
        onConfirm={() => {
          if (deleting) softDelete(deleting);
        }}
      />

      <Fab onClick={() => router.push("/documents/new")} label={t("docs.newDocument")} />
    </div>
  );
}