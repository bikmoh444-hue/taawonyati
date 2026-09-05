import { notFound } from "next/navigation";
import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentForm } from "@/components/coop/documents/document-form";
import type { Client, DocumentWithItems, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const { cooperative } = await requireCooperativeUser();
  const supabase = createClient();

  const [docRes, clientsRes, productsRes] = await Promise.all([
    supabase
      .from("documents")
      .select("*, client:clients(*), document_items(*)")
      .eq("id", params.id)
      .maybeSingle<DocumentWithItems>(),
    supabase.from("clients").select("*").order("name").returns<Client[]>(),
    supabase
      .from("products")
      .select("*")
      .is("deleted_at", null)
      .order("name")
      .returns<Product[]>(),
  ]);

  if (!docRes.data) notFound();

  return (
    <DocumentForm
      cooperative={cooperative!}
      clients={clientsRes.data ?? []}
      products={productsRes.data ?? []}
      initial={docRes.data}
    />
  );
}