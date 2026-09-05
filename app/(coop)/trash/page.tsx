import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TrashManager } from "@/components/coop/trash/trash-manager";
import type { DocumentWithClient, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  await requireCooperativeUser();
  const supabase = createClient();

  const [docsRes, prodsRes] = await Promise.all([
    supabase
      .from("documents")
      .select("*, clients(name)")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .returns<DocumentWithClient[]>(),
    supabase
      .from("products")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .returns<Product[]>(),
  ]);

  return (
    <TrashManager
      documents={docsRes.data ?? []}
      products={prodsRes.data ?? []}
    />
  );
}