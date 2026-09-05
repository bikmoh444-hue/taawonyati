import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentsManager } from "@/components/coop/documents/documents-manager";
import type { DocumentWithClient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  await requireCooperativeUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("documents")
    .select("*, clients(name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<DocumentWithClient[]>();

  return <DocumentsManager documents={data ?? []} />;
}