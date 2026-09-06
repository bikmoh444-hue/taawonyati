"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Edit3,
  Loader2,
  MapPin,
  MoreVertical,
  Phone,
  Trash2,
  ClipboardList,
  FileClock,
  FilePlus2,
  FileText,
  Building2,
  User,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Client,
  Cooperative,
  DocumentItem,
  DocumentWithClient,
} from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtDate, fmtMoney } from "@/lib/format";
import { toArabicWords, toFrenchWords } from "@/lib/numbers/amount-to-words";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function typeConfig(type: string) {
  switch (type) {
    case "FAC":
      return { icon: FileText, label: "docs.invoice", color: "bg-teal-50 text-teal-700" };
    case "DEV":
      return { icon: FileClock, label: "docs.devis", color: "bg-blue-50 text-blue-700" };
    case "BDL":
      return {
        icon: ClipboardList,
        label: "docs.deliveryNote",
        color: "bg-orange-50 text-orange-700",
      };
    default:
      return {
        icon: FilePlus2,
        label: "docs.purchaseOrder",
        color: "bg-purple-50 text-purple-700",
      };
  }
}

export function DocumentDetail({
  record,
  items,
  client,
  cooperative,
  isPaidTogglable,
}: {
  record: DocumentWithClient;
  items: DocumentItem[];
  client: Client | null;
  cooperative: Cooperative;
  isPaidTogglable: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cfg = typeConfig(record.type);
  const Icon = cfg.icon;
  const words =
    locale === "ar"
      ? toArabicWords(record.total)
      : toFrenchWords(record.total);
  const subTotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pdf/document/${record.id}`, {
        credentials: "same-origin",
      });
      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok || !contentType.includes("application/pdf")) {
        toast.error(t("toasts.pdfError"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taawoniati-${record.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("toasts.pdfError"));
    } finally {
      setDownloading(false);
    }
  }

  async function togglePaid() {
    const { error } = await supabase
      .from("documents")
      .update({ is_paid: !record.is_paid })
      .eq("id", record.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.saved"));
    router.refresh();
  }

  async function softDelete() {
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", record.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.deleted"));
    setDeleting(false);
    router.push("/documents");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl ${cfg.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold text-navy">{record.number}</p>
            <p className="text-sm font-medium text-muted-foreground">
              {t(cfg.label as never)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {record.type === "FAC" && (
              <Badge variant={record.is_paid ? "success" : "warning"}>
                {record.is_paid ? t("docs.paidBadge") : t("docs.unpaidBadge")}
              </Badge>
            )}
            <Badge variant="outline">{t("docs.draftBadge")}</Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="rounded-full"
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {t("docs.savePdf")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {record.status === "draft" && (
              <DropdownMenuItem
                onClick={() => router.push(`/documents/${record.id}/edit`)}
              >
                <Edit3 className="h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
            )}
            {isPaidTogglable && (
              <DropdownMenuItem onClick={togglePaid}>
                {t("docs.togglePaid")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleting(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Partner + coop */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-navy">
            <User className="h-4 w-4 text-primary" />
            {t("docs.recipient")}
          </div>
          {client ? (
            <div className="mt-3 space-y-1.5">
              <p className="font-semibold text-navy">{client.name}</p>
              {client.ice && (
                <p className="text-sm text-muted-foreground">
                  ICE: {client.ice}
                </p>
              )}
              {client.phone && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span dir="ltr">{client.phone}</span>
                </p>
              )}
              {client.address && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.address}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("common.none")}</p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-navy">
            <Building2 className="h-4 w-4 text-primary" />
            {t("docs.cooperativeDetails")}
          </div>
          <div className="mt-3 space-y-1.5">
            <p className="font-semibold text-navy">
              {cooperative.name_ar || cooperative.name_fr || cooperative.name}
            </p>
            {cooperative.ice && (
              <p className="text-sm text-muted-foreground">ICE: {cooperative.ice}</p>
            )}
            {cooperative.rlc && (
              <p className="text-sm text-muted-foreground">RLC: {cooperative.rlc}</p>
            )}
            {cooperative.address && (
              <p className="text-sm text-muted-foreground">
                {cooperative.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Doc info */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t("docs.date")}</p>
            <p className="font-semibold text-navy" dir="ltr">
              {fmtDate(record.date, "fr")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("docs.paymentMethod")}</p>
            <p className="font-semibold text-navy">
              {record.payment_method || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("docs.deliveryLocation")}</p>
            <p className="font-semibold text-navy">
              {record.delivery_location || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-navy">{t("docs.items")}</p>
        <Separator className="my-3" />
        <div className="space-y-2.5">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-soft px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">
                  {it.product_ref || it.description || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {it.description && it.product_ref !== it.description
                    ? it.description
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {it.quantity} × {fmtMoney(it.unit_price, "fr")}
                  {it.unit ? ` / ${it.unit}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-bold text-navy" dir="ltr">
                {fmtMoney(it.quantity * it.unit_price, "fr")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("docs.itemTotal")}</span>
          <span dir="ltr">{fmtMoney(subTotal, "fr")}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("docs.discountLabel")}</span>
          <span dir="ltr">- {fmtMoney(record.discount, "fr")}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("docs.tvaLabel")}</span>
          <span dir="ltr">{fmtMoney(record.tva_amount, "fr")}</span>
        </div>
        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="font-bold">{t("docs.total")}</span>
            <span className="text-xl font-extrabold" dir="ltr">
              {fmtMoney(record.total, "fr")}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/70">
            {t("docs.arrivesTo")}: {words}{" "}
            {locale === "ar" ? "درهم" : "dirhams"}
          </div>
        </div>
      </div>

      {/* Notes */}
      {record.notes && (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-navy">{t("docs.notesAdditional")}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {record.notes}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("common.confirmDelete")}
        description={t("common.confirmDeleteMessage")}
        onConfirm={softDelete}
      />
    </div>
  );
}