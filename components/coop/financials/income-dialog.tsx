"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DocumentWithClient, Income } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { INCOME_CATEGORIES } from "@/lib/constants";
import { fmtMoney } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const SALES_CATEGORY = "مبيعات";

export function IncomeDialog({
  open,
  onOpenChange,
  income,
  invoices,
  coopId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: Income | null;
  invoices: DocumentWithClient[];
  coopId: string | null;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [category, setCategory] = useState(income?.category ?? INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState(income ? String(income.amount) : "");
  const [date, setDate] = useState(income?.date?.slice(0, 10) ?? todayISO());
  const [note, setNote] = useState(income?.note ?? "");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isSales = category === SALES_CATEGORY;
  const autoAmount = useMemo(
    () =>
      invoices
        .filter((d) => selectedInvoices.includes(d.id))
        .reduce((s, d) => s + (d.total ?? 0), 0),
    [invoices, selectedInvoices]
  );

  function toggleInvoice(id: string) {
    setSelectedInvoices((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  }

  async function save() {
    const value = autoAmount || parseFloat(amount);
    if (isNaN(value) || value < 0) {
      toast.error(t("financials.amountRequired"));
      return;
    }
    if (!category) {
      toast.error(t("financials.categoryRequired"));
      return;
    }
    setSaving(true);
    try {
      if (income) {
        const { error } = await supabase
          .from("incomes")
          .update({ category, amount: value, date, note: note.trim() || null })
          .eq("id", income.id);
        if (error) throw error;
      } else if (isSales) {
        const rows = selectedInvoices.map((docId) => ({
          cooperative_id: coopId,
          category: SALES_CATEGORY,
          amount: invoices.find((d) => d.id === docId)?.total ?? 0,
          date,
          note: note.trim() || null,
          source: "invoice",
          document_id: docId,
        }));
        if (rows.length === 0) {
          toast.error(t("financials.amountRequired"));
          return;
        }
        const { error } = await supabase.from("incomes").insert(rows);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("incomes")
          .insert({
            cooperative_id: coopId,
            category,
            amount: value,
            date,
            note: note.trim() || null,
            source: "manual",
            document_id: null,
          });
        if (error) throw error;
      }
      toast.success(t("financials.incomeSaved"));
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("financials.addIncome")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("financials.categoryLabel")}</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-[#eef1f0] px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              {INCOME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {isSales && invoices.length > 0 && (
            <div className="space-y-2">
              <Label>{t("financials.fromInvoice")}</Label>
              <div className="max-h-52 space-y-2 overflow-y-auto rounded-2xl border border-border bg-soft p-2">
                {invoices.map((d) => {
                  const active = selectedInvoices.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleInvoice(d.id)}
                      className={
                        active
                          ? "flex w-full items-center justify-between rounded-xl border-2 border-primary bg-white p-2.5 text-start"
                          : "flex w-full items-center justify-between rounded-xl border border-transparent bg-white p-2.5 text-start"
                      }
                    >
                      <span className="text-sm font-semibold text-navy">
                        {d.number}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {d.clients?.name ?? ""}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-primary" dir="ltr">
                        {fmtMoney(d.total ?? 0, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("financials.salesTotal")}:{" "}
                <span dir="ltr">{fmtMoney(autoAmount, locale)}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("financials.amountLabel")}</Label>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={isSales && !income ? (selectedInvoices.length ? String(autoAmount) : "") : amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSales && !income && selectedInvoices.length > 0}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("financials.dateLabel")}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("financials.noteLabel")}</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {isSales && !income && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t("financials.salesBlock")}</Badge>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}