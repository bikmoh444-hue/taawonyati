import { notFound } from "next/navigation";
import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentDetail } from "@/components/coop/documents/document-detail";
import type {
  Client,
  DocumentItem,
  DocumentWithClient,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { cooperative } = await requireCooperativeUser();
  const supabase = createClient();

  const [docRes, itemsRes, clientRes] = await Promise.all([
    supabase
      .from("documents")
      .select("*, clients(name)")
      .eq("id", params.id)
      .maybeSingle<DocumentWithClient>(),
    supabase
      .from("document_items")
      .select("*")
      .eq("document_id", params.id)
      .returns<DocumentItem[]>(),
    supabase
      .from("documents")
      .select("client_id")
      .eq("id", params.id)
      .single(),
  ]);

  const record = docRes.data;
  if (!record) notFound();

  let client: Client | null = null;
  if (clientRes.data?.client_id) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientRes.data.client_id)
      .maybeSingle<Client>();
    client = data ?? null;
  }

  return (
    <DocumentDetail
      record={record}
      items={itemsRes.data ?? []}
      client={client}
      cooperative={cooperative!}
      isPaidTogglable={record.type === "FAC"}
    />
  );
}