"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { normalizeMarocPhone } from "@/lib/format";
import { FormField, SectionHeading } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1, { message: "name" }),
  phone: z.string().min(1, { message: "phone" }),
  ice: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), { message: "ice" }),
  address: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function ClientForm({
  client,
  coopId,
  onSaved,
  onCancel,
}: {
  client?: Client | null;
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
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      ice: client?.ice ?? "",
      address: client?.address ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      ice: client?.ice ?? "",
      address: client?.address ?? "",
    });
  }, [client, reset]);

  async function onSubmit(values: Values) {
    const phone = normalizeMarocPhone(values.phone);
    const payload = {
      name: values.name.trim(),
      phone,
      ice: values.ice?.trim() || null,
      address: values.address?.trim() || null,
    };
    const { error } = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase
          .from("clients")
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
      <SectionHeading>{t("clients.title")}</SectionHeading>
      <Separator />
      <FormField
        label={t("clients.nameLabel")}
        required
        error={errors.name?.message === "name" ? t("clients.nameRequired") : undefined}
      >
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField
        label={t("clients.phoneLabel")}
        required
        hint="+212"
        error={
          errors.phone?.message === "phone" ? t("clients.phoneRequired") : undefined
        }
      >
        <Input {...register("phone")} inputMode="tel" dir="ltr" className="text-start" />
      </FormField>
      <FormField
        label={t("clients.iceLabel")}
        error={errors.ice?.message === "ice" ? t("clients.iceInvalid") : undefined}
      >
        <Input {...register("ice")} inputMode="numeric" dir="ltr" className="text-start" />
      </FormField>
      <FormField label={t("clients.addressLabel")}>
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