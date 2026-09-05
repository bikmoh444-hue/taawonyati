import { notFound } from "next/navigation";
import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/coop/products/product-form";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await requireCooperativeUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Product>();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <ProductForm product={data} coopId={profile.cooperative_id} />
    </div>
  );
}