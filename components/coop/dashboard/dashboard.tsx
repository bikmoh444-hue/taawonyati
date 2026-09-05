"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownCircle, ArrowUpCircle, Scale, FileText, TriangleAlert } from "lucide-react";
import type { Cooperative, DocumentWithClient, Expense, Income } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { fmtDate, fmtMoney, monthLabel, round2 } from "@/lib/format";
import { expenseCategoryStyle, incomeCategoryStyle } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Op {
  id: string;
  kind: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string | null;
  source?: string;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "red" | "navy";
}) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    red: "bg-red-100 text-red-500",
    navy: "bg-navy text-white",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold text-navy">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function lastMonths(count: number): Date[] {
  const months: Date[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
}

function buildTrend(
  expenses: Expense[],
  incomes: Income[],
  locale: "ar" | "fr"
) {
  const months = lastMonths(6);
  return months.map((m) => {
    const key = `${m.getFullYear()}-${m.getMonth()}`;
    let income = 0;
    let expense = 0;
    for (const e of expenses) {
      const d = new Date(e.date);
      if (`${d.getFullYear()}-${d.getMonth()}` === key) income += Number(e.amount);
    }
    for (const x of incomes) {
      const d = new Date(x.date);
      if (`${d.getFullYear()}-${d.getMonth()}` === key) expense += Number(x.amount);
    }
    return {
      label: monthLabel(m, locale),
      income: round2(income),
      expense: round2(expense),
    };
  });
}

function docsTypeLabel(t: string): string {
  if (t === "FAC") return "FAC";
  if (t === "DEV") return "DEV";
  if (t === "BDL") return "BDL";
  return "DOC";
}

export function Dashboard({
  expenses,
  incomes,
  recentDocuments,
  cooperative,
  cooperativeComplete,
}: {
  expenses: Expense[];
  incomes: Income[];
  recentDocuments: DocumentWithClient[];
  cooperative?: Cooperative | null;
  cooperativeComplete?: boolean;
}) {
  const { t, locale } = useI18n();

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  let monthIncome = 0;
  let monthExpense = 0;
  for (const e of expenses) {
    const d = new Date(e.date);
    if (`${d.getFullYear()}-${d.getMonth()}` === monthKey) monthIncome += Number(e.amount);
  }
  for (const x of incomes) {
    const d = new Date(x.date);
    if (`${d.getFullYear()}-${d.getMonth()}` === monthKey) monthExpense += Number(x.amount);
  }
  const balance = round2(monthIncome - monthExpense);

  const ops: Op[] = [
    ...incomes.map((i) => ({
      id: "inc-" + i.id,
      kind: "income" as const,
      category: i.category,
      amount: Number(i.amount),
      date: i.date,
      note: i.note,
      source: i.source,
    })),
    ...expenses.map((x) => ({
      id: "exp-" + x.id,
      kind: "expense" as const,
      category: x.category,
      amount: Number(x.amount),
      date: x.date,
      note: x.note,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const trend = buildTrend(expenses, incomes, locale);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">{t("dashboard.greeting")}</h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {!cooperativeComplete && (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy">
                {t("dashboard.profileIncompleteTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.profileIncompleteDesc")}
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="shrink-0 rounded-full bg-navy px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-navy/90"
          >
            {t("dashboard.completeProfile")}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ArrowUpCircle className="h-6 w-6" />}
          label={`${t("dashboard.income")} · ${t("dashboard.period")}`}
          value={fmtMoney(monthIncome, locale)}
          tone="teal"
        />
        <StatCard
          icon={<ArrowDownCircle className="h-6 w-6" />}
          label={`${t("dashboard.expense")} · ${t("dashboard.period")}`}
          value={fmtMoney(monthExpense, locale)}
          tone="red"
        />
        <StatCard
          icon={<Scale className="h-6 w-6" />}
          label={t("dashboard.balance")}
          value={fmtMoney(balance, locale)}
          tone="navy"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {t("dashboard.trend")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip
                formatter={(v) => fmtMoney(Number(v), locale)}
                labelStyle={{ fontFamily: "inherit" }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#0d9488"
                fill="url(#gInc)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f97316"
                fill="url(#gExp)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent documents */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {t("dashboard.recentDocuments")}
            </CardTitle>
            <Link
              href="/documents"
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDocuments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("dashboard.noData")}
              </p>
            ) : (
              recentDocuments.map((d) => (
                <Link
                  key={d.id}
                  href={`/documents/${d.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-soft px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy">
                      {d.clients?.name || t("common.none")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.number} · {fmtDate(d.date, locale)}
                    </p>
                  </div>
                  <div className="text-end">
                    <Badge variant="outline" className="text-primary">
                      {docsTypeLabel(d.type)}
                    </Badge>
                    <p className="mt-0.5 text-sm font-bold text-navy" dir="ltr">
                      {fmtMoney(d.total, locale)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent operations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {t("dashboard.recentOperations")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ops.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("dashboard.noData")}
              </p>
            ) : (
              ops.map((op) => {
                const style =
                  op.kind === "income"
                    ? incomeCategoryStyle(op.category)
                    : expenseCategoryStyle(op.category);
                const Icon = style.icon;
                const sign = op.kind === "income" ? "+" : "−";
                return (
                  <div
                    key={op.id}
                    className="flex items-center gap-3 rounded-2xl bg-soft px-4 py-3"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">
                        {op.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(op.date, locale)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${op.kind === "income" ? "text-emerald-600" : "text-red-500"}`}
                      dir="ltr"
                    >
                      {sign}
                      {fmtMoney(op.amount, locale).replace(/^\+/, "")}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}