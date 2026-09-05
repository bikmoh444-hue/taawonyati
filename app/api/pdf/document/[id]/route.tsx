import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { DocumentPdf } from "@/lib/pdf/document-template";
import type {
  Client,
  Cooperative,
  DocumentItem,
  DocumentRow,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let record: DocumentRow | null = null;
  let items: DocumentItem[];
  try {
    const [docRes, itemsRes] = await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .eq("id", params.id)
        .maybeSingle<DocumentRow>(),
      supabase
        .from("document_items")
        .select("*")
        .eq("document_id", params.id)
        .returns<DocumentItem[]>(),
    ]);

    if (itemsRes.error) {
      console.error(
        `[pdf/document] failed to load document_items for ${params.id}:`,
        itemsRes.error
      );
      return NextResponse.json(
        { error: "Failed to load document items" },
        { status: 500 }
      );
    }

    record = docRes.data;
    items = itemsRes.data ?? [];
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (items.length === 0) {
      console.warn(
        `[pdf/document] ${record.number} (${record.type}) has 0 document_items`
      );
    }
  } catch (err) {
    console.error(`[pdf/document] query failed for ${params.id}`, err);
    return NextResponse.json(
      { error: "Failed to load document data" },
      { status: 500 }
    );
  }

  let client: Client | null = null;
  let cooperative: Cooperative | null = null;

  const [clientRes, coopRes] = await Promise.all([
    record.client_id
      ? supabase
          .from("clients")
          .select("*")
          .eq("id", record.client_id)
          .maybeSingle<Client>()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("cooperatives")
      .select("*")
      .eq("id", record.cooperative_id)
      .maybeSingle<Cooperative>(),
  ]);
  client = clientRes.data ?? null;
  cooperative = coopRes.data ?? null;

  if (!cooperative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      <DocumentPdf
        record={record}
        items={items}
        client={client}
        cooperative={cooperative}
      />
    );
  } catch (err) {
    console.error(`[pdf/document] render failed for ${record.number}`, err);
    return NextResponse.json(
      { error: "Failed to render PDF" },
      { status: 500 }
    );
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="taawonyati-${record.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}