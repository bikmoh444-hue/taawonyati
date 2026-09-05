"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Supplier } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_REGEX } from "@/lib/format";
import { FormField, SectionHeading } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1, { message: "name" }),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || EMAIL_REGEX.test(v), { message: "email" }),
  address: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function SupplierForm({
  supplier,
  coopId,
  onSaved,
  onCancel,
}: {
  supplier?: Supplier | null;
  coopId?: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: supplier?.name ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: supplier?.name ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
    });
  }, [supplier, reset]);

  async function onSubmit(values: Values) {
    const payload = {
      name: values.name.trim(),
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
    };
    const { error } = supplier
      ? await supabase.from("suppliers").update(payload).eq("id", supplier.id)
      : await supabase
          .from("suppliers")
          .insert({ ...payload, cooperative_id: coopId });
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.saved"));
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <SectionHeading>{t("suppliers.title")}</SectionHeading>
      <Separator />
      <FormField
        label={t("suppliers.nameLabel")}
        required
        error={errors.name?.message === "name" ? t("suppliers.nameRequired") : undefined}
      >
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField label={t("suppliers.phoneLabel")}>
        <Input {...register("phone")} inputMode="tel" dir="ltr" className="text-start" />
      </FormField>
      <FormField
        label={t("suppliers.emailLabel")}
        error={errors.email?.message === "email" ? t("suppliers.emailInvalid") : undefined}
      >
        <Input {...register("email")} type="email" dir="ltr" className="text-start" />
      </FormField>
      <FormField label={t("suppliers.addressLabel")}>
        <Input {...register("address")} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}