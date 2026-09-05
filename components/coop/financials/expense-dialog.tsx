"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Expense } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  coopId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  coopId: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [category, setCategory] = useState(expense?.category ?? EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [date, setDate] = useState(expense?.date?.slice(0, 10) ?? todayISO());
  const [note, setNote] = useState(expense?.note ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    const value = parseFloat(amount);
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
      const payload = {
        category,
        amount: value,
        date,
        note: note.trim() || null,
      };
      const { error } = expense
        ? await supabase.from("expenses").update(payload).eq("id", expense.id)
        : await supabase
            .from("expenses")
            .insert({ ...payload, cooperative_id: coopId });
      if (error) throw error;
      toast.success(t("financials.expenseSaved"));
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
          <DialogTitle>
            {expense ? t("financials.editExpense") : t("financials.addExpense")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("financials.categoryLabel")}</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-[#eef1f0] px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t("financials.amountLabel")}</Label>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("financials.dateLabel")}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("financials.noteLabel")}</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
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