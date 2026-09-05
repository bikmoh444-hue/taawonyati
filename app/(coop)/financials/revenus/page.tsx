import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FinancialsManager } from "@/components/coop/financials/financials-manager";
import type {
  DocumentWithClient,
  Expense,
  Income,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FinancialsRevenusPage() {
  const { profile } = await requireCooperativeUser();
  const supabase = createClient();

  const [expensesRes, incomesRes, invoicesRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .returns<Expense[]>(),
    supabase
      .from("incomes")
      .select("*")
      .order("date", { ascending: false })
      .returns<Income[]>(),
    supabase
      .from("documents")
      .select("*, clients(name)")
      .eq("type", "FAC")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .returns<DocumentWithClient[]>(),
  ]);

  return (
    <FinancialsManager
      expenses={expensesRes.data ?? []}
      incomes={incomesRes.data ?? []}
      invoices={invoicesRes.data ?? []}
      coopId={profile.cooperative_id}
      initialTab="incomes"
    />
  );
}