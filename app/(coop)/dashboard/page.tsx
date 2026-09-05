import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/coop/dashboard/dashboard";
import { cooperativeIsComplete } from "@/lib/cooperative";
import type { DocumentWithClient, Expense, Income } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { cooperative } = await requireCooperativeUser();
  const supabase = createClient();

  const [expenses, incomes, recentDocuments] = await Promise.all([
    supabase.from("expenses").select("*").order("date", { ascending: false }).returns<Expense[]>(),
    supabase
      .from("incomes")
      .select("*")
      .order("date", { ascending: false })
      .returns<Income[]>(),
    supabase
      .from("documents")
      .select("*, clients(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<DocumentWithClient[]>(),
  ]);

  return (
    <Dashboard
      cooperative={cooperative}
      cooperativeComplete={cooperativeIsComplete(cooperative)}
      expenses={expenses.data ?? []}
      incomes={incomes.data ?? []}
      recentDocuments={recentDocuments.data ?? []}
    />
  );
}