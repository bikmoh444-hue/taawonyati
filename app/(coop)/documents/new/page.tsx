import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentForm } from "@/components/coop/documents/document-form";
import type { Client, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const { profile, cooperative } = await requireCooperativeUser();
  const supabase = createClient();

  const [clientsRes, productsRes, typesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .order("name")
      .returns<Client[]>(),
    supabase
      .from("products")
      .select("*")
      .is("deleted_at", null)
      .order("name")
      .returns<Product[]>(),
    supabase.from("documents").select("type"),
  ]);

  const clients = clientsRes.data ?? [];
  const products = productsRes.data ?? [];

  // Next number per type, counting ALL documents (incl. soft-deleted) — the
  // mobile generator's behaviour, including its number "skips".
  const docCounts: Record<string, number> = {};
  for (const { type } of typesRes.data ?? []) {
    docCounts[type] = (docCounts[type] ?? 0) + 1;
  }

  return (
    <DocumentForm
      cooperative={cooperative!}
      clients={clients}
      products={products}
      initial={null}
      docCounts={docCounts}
    />
  );
}