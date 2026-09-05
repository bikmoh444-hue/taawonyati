"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { DocumentWithClient, Expense, Income } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, fmtDate } from "@/lib/format";
import { PERIODS, type PeriodKey } from "@/lib/constants";
import { isInPeriod } from "@/lib/periods";
import {
  expenseCategoryStyle,
  incomeCategoryStyle,
} from "@/lib/categories";
import { FilterChips, type ChipOption } from "@/components/shared/filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { Fab } from "@/components/shared/fab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExpenseDialog } from "@/components/coop/financials/expense-dialog";
import { IncomeDialog } from "@/components/coop/financials/income-dialog";

type Tab = "expenses" | "incomes";

function groupByCategory<T extends { category: string; amount: number }>(
  rows: T[]
) {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
  }
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function FinancialsManager({
  expenses,
  incomes,
  invoices,
  coopId,
  initialTab = "expenses",
}: {
  expenses: Expense[];
  incomes: Income[];
  invoices: DocumentWithClient[];
  coopId: string | null;
  initialTab?: Tab;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [deleting, setDeleting] = useState<{ kind: Tab; id: string } | null>(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const periodChips: ChipOption[] = useMemo(
    () =>
      PERIODS.map((p) => ({
        value: p,
        label: t(`financials.${p}` as never),
      })),
    [t]
  );

  const periodRows = useMemo(() => {
    const ex = expenses.filter((e) => isInPeriod(e.date, period));
    const inc = incomes.filter((e) => isInPeriod(e.date, period));
    return { expenses: ex, incomes: inc };
  }, [expenses, incomes, period]);

  const rows = tab === "expenses" ? periodRows.expenses : periodRows.incomes;

  const summary = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const categories = groupByCategory(rows);
    return { total, categories };
  }, [rows]);

  async function remove() {
    if (!deleting) return;
    const table = deleting.kind === "expenses" ? "expenses" : "incomes";
    const { error } = await supabase.from(table).delete().eq("id", deleting.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(
      deleting.kind === "expenses"
        ? t("financials.expenseDeleted")
        : t("financials.incomeDeleted")
    );
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="expenses">
            <TrendingDown className="h-4 w-4" />
            {t("financials.tabExpenses")}
          </TabsTrigger>
          <TabsTrigger value="incomes">
            <TrendingUp className="h-4 w-4" />
            {t("financials.tabIncomes")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterChips
        options={periodChips}
        selected={period}
        onSelect={(v) => setPeriod((v as PeriodKey) ?? "month")}
      />

      {/* Summary */}
      <div className="rounded-3xl bg-navy p-5 text-white">
        <p className="text-sm text-white/70">{t("financials.summaryTitle")}</p>
        <p className="mt-1 text-3xl font-extrabold" dir="ltr">
          {fmtMoney(summary.total, locale)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">{t("financials.totalAmount")}</p>
            <p className="text-sm font-bold" dir="ltr">
              {fmtMoney(summary.total, locale)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">{t("financials.categoriesCount")}</p>
            <p className="text-sm font-bold">
              {summary.categories.length} {t("financials.categoriesCount")}
            </p>
          </div>
        </div>
      </div>

      {/* Top categories */}
      {summary.categories.length > 0 && (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-navy">
            {t("financials.topCategories")}
          </p>
          <div className="mt-3 space-y-2">
            {summary.categories.map((c) => {
              const style =
                tab === "expenses"
                  ? expenseCategoryStyle(c.category)
                  : incomeCategoryStyle(c.category);
              const Icon = style.icon;
              const pct =
                summary.total > 0
                  ? Math.round((c.total / summary.total) * 100)
                  : 0;
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-navy">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg ${style.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {c.category}
                    </span>
                    <span className="font-bold text-navy" dir="ltr">
                      {fmtMoney(c.total, locale)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      {rows.length === 0 ? (
        <EmptyState
          icon={
            tab === "expenses" ? (
              <TrendingDown className="h-9 w-9" strokeWidth={1.5} />
            ) : (
              <TrendingUp className="h-9 w-9" strokeWidth={1.5} />
            )
          }
          message={
            tab === "expenses"
              ? t("financials.emptyExpense")
              : t("financials.emptyIncome")
          }
        />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const style =
              tab === "expenses"
                ? expenseCategoryStyle(r.category)
                : incomeCategoryStyle(r.category);
            const Icon = style.icon;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-start"
                  onClick={() => {
                    if (tab === "expenses") {
                      setEditingExpense(r as Expense);
                      setExpenseOpen(true);
                    } else if ((r as Income).source !== "invoice") {
                      setEditingIncome(r as Income);
                      setIncomeOpen(true);
                    }
                  }}
                >
                  <p className="truncate font-semibold text-navy">{r.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.note || fmtDate(r.date, locale)}
                  </p>
                </button>
                <div className="shrink-0 text-end">
                  <p className="font-bold text-navy" dir="ltr">
                    {fmtMoney(r.amount, locale)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(r.date, locale)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => setDeleting({ kind: tab, id: r.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={t("common.confirmDeleteMessage")}
        onConfirm={remove}
      />

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={(o) => {
          setExpenseOpen(o);
          if (!o) setEditingExpense(null);
        }}
        expense={editingExpense}
        coopId={coopId}
      />
      <IncomeDialog
        open={incomeOpen}
        onOpenChange={(o) => {
          setIncomeOpen(o);
          if (!o) setEditingIncome(null);
        }}
        income={editingIncome}
        invoices={invoices}
        coopId={coopId}
      />

      <Fab
        onClick={() => {
          if (tab === "expenses") setExpenseOpen(true);
          else setIncomeOpen(true);
        }}
        label={tab === "expenses" ? t("financials.addExpense") : t("financials.addIncome")}
      />
    </div>
  );
}