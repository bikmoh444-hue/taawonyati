import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuppliersManager } from "@/components/coop/suppliers/suppliers-manager";
import type { Supplier } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const session = await requireCooperativeUser();
  const supabase = createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Supplier[]>();

  return <SuppliersManager suppliers={suppliers ?? []} coopId={session.profile.cooperative_id} />;
}