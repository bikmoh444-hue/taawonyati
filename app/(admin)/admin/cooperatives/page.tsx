import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminCooperativesManager } from "@/components/admin/admin-cooperatives-manager";
import type { Cooperative } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCooperativesPage() {
  await requireAdminUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("cooperatives")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Cooperative[]>();

  return <AdminCooperativesManager cooperatives={data ?? []} />;
}