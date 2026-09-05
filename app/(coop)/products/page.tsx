import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductsManager } from "@/components/coop/products/products-manager";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireCooperativeUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("name")
    .returns<Product[]>();

  return <ProductsManager products={data ?? []} />;
}