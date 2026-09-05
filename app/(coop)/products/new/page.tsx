import { requireCooperativeUser } from "@/lib/auth";
import { ProductForm } from "@/components/coop/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { profile } = await requireCooperativeUser();
  return (
    <div className="mx-auto max-w-2xl">
      <ProductForm coopId={profile.cooperative_id} />
    </div>
  );
}