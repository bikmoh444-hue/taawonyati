"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { productCategoryLabel } from "@/lib/labels";
import { FormField, SectionHeading } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";

const schema = z.object({
  name: z.string().min(1, { message: "name" }),
  category: z.string().optional(),
  price: z.coerce.number({ message: "price" }).nonnegative({ message: "price" }),
  stock: z.coerce
    .number({ message: "stock" })
    .int({ message: "stock" })
    .nonnegative({ message: "stock" }),
  min_stock: z.coerce
    .number({ message: "minSt" })
    .int({ message: "minSt" })
    .nonnegative({ message: "minSt" }),
});
type Values = z.infer<typeof schema>;

export function ProductForm({
  product,
  coopId,
}: {
  product?: Product | null;
  coopId: string | null;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [isBio, setIsBio] = useState(product?.is_bio ?? false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(product?.photo_url ?? null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "autre",
      price: product ? Number(product.price) : undefined,
      stock: product ? Number(product.stock) : undefined,
      min_stock: product ? Number(product.min_stock) : undefined,
    },
  });

  useEffect(() => {
    reset({
      name: product?.name ?? "",
      category: product?.category ?? "autre",
      price: product ? Number(product.price) : undefined,
      stock: product ? Number(product.stock) : undefined,
      min_stock: product ? Number(product.min_stock) : undefined,
    });
    setIsBio(product?.is_bio ?? false);
    setPhotoUrl(product?.photo_url ?? null);
  }, [product, reset]);

  async function onSubmit(values: Values) {
    const payload = {
      name: values.name.trim(),
      category: values.category || "autre",
      price: values.price,
      stock: values.stock,
      min_stock: values.min_stock,
      is_bio: isBio,
      photo_url: photoUrl,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase
          .from("products")
          .insert({ ...payload, cooperative_id: coopId });

    if (error) {
      console.error(error);
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.saved"));
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{t("products.basicInfo")}</SectionHeading>
        <Separator className="my-4" />
        <div className="space-y-4">
          <FormField
            label={t("products.nameLabel")}
            required
            error={
              errors.name?.message === "name" ? t("products.nameRequired") : undefined
            }
          >
            <Input {...register("name")} autoFocus />
          </FormField>
          <FormField label={t("products.categoryLabel")}>
            <Select
              value={watch("category") || "autre"}
              onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.categoryLabel")} />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {productCategoryLabel(c, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
            <Label className="font-semibold">{t("products.bio")}</Label>
            <Switch checked={isBio} onCheckedChange={setIsBio} />
          </div>
          <FormField label={t("products.image")} hint={t("products.imageHelp")}>
            <ImageUpload
              kind="product"
              value={photoUrl}
              onChange={setPhotoUrl}
              helperText={t("products.imageHelp")}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{t("products.pricingStock")}</SectionHeading>
        <Separator className="my-4" />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label={t("products.priceLabel")}
            required
            error={errors.price ? t("products.priceRequired") : undefined}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              dir="ltr"
              className="text-start"
              {...register("price")}
            />
          </FormField>
          <FormField
            label={t("products.stockLabel")}
            required
            error={errors.stock ? t("products.stockRequired") : undefined}
          >
            <Input
              type="number"
              min="0"
              dir="ltr"
              className="text-start"
              {...register("stock")}
            />
          </FormField>
          <FormField
            label={t("products.minStockLabel")}
            required
            error={errors.min_stock ? t("products.minStockRequired") : undefined}
          >
            <Input
              type="number"
              min="0"
              dir="ltr"
              className="text-start"
              {...register("min_stock")}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}