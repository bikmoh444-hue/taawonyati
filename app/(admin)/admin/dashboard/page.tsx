import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { Cooperative } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const supabase = createClient();

  const [coopsRes, incomesRes] = await Promise.all([
    supabase
      .from("cooperatives")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Cooperative[]>(),
    supabase.from("incomes").select("amount"),
  ]);

  const revenue = (incomesRes.data ?? []).reduce(
    (s, r) => s + (r.amount ?? 0),
    0
  );

  return (
    <AdminDashboard cooperatives={coopsRes.data ?? []} revenue={revenue} />
  );
}