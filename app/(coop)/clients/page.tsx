import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientsManager } from "@/components/coop/clients/clients-manager";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await requireCooperativeUser();
  const supabase = createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Client[]>();

  return <ClientsManager clients={clients ?? []} coopId={session.profile.cooperative_id} />;
}