"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Cooperative } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { EMAIL_REGEX, normalizeMarocPhone } from "@/lib/format";
import { FormField, SectionHeading } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/shared/image-upload";

const schema = z.object({
  name_fr: z.string().min(1, { message: "nameFr" }),
  name_ar: z.string().min(1, { message: "nameAr" }),
  address: z.string().min(1, { message: "address" }),
  phone: z.string().min(1, { message: "phone" }),
  email: z
    .string()
    .min(1, { message: "email" })
    .refine((v) => EMAIL_REGEX.test(v), { message: "emailInvalid" }),
  ice: z
    .string()
    .min(1, { message: "iceRequired" })
    .refine((v) => /^\d+$/.test(v), { message: "iceInvalid" }),
  rlc: z.string().optional(),
  if_number: z.string().optional(),
  secteur: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function CooperativeForm({
  cooperative,
  isSetup,
}: {
  cooperative: Cooperative | null;
  isSetup: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(cooperative?.logo_url ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_fr: cooperative?.name_fr ?? "",
      name_ar: cooperative?.name_ar ?? "",
      address: cooperative?.address ?? "",
      phone: cooperative?.phone ?? "",
      email: cooperative?.email ?? "",
      ice: cooperative?.ice ?? "",
      rlc: cooperative?.rlc ?? "",
      if_number: cooperative?.if_number ?? "",
      secteur: cooperative?.secteur ?? "",
    },
  });

  async function onSubmit(values: Values) {
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        phone: normalizeMarocPhone(values.phone),
        logo_url: logoUrl,
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      console.error(json);
      toast.error(
        typeof json?.error === "string" ? json.error : t("toasts.error")
      );
      return;
    }
    toast.success(t("setup.success"));
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{t("setup.basicInfo")}</SectionHeading>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("setup.nameFr")}
              required
              error={
                errors.name_fr?.message === "nameFr"
                  ? t("setup.nameFrRequired")
                  : undefined
              }
            >
              <Input {...register("name_fr")} autoFocus />
            </FormField>
            <FormField
              label={t("setup.nameAr")}
              required
              error={
                errors.name_ar?.message === "nameAr"
                  ? t("setup.nameArRequired")
                  : undefined
              }
            >
              <Input {...register("name_ar")} />
            </FormField>
          </div>
          <FormField
            label={t("setup.address")}
            required
            error={
              errors.address?.message === "address"
                ? t("setup.addressRequired")
                : undefined
            }
          >
            <Input {...register("address")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("setup.phone")}
              required
              error={
                errors.phone?.message === "phone"
                  ? t("setup.phoneRequired")
                  : undefined
              }
            >
              <Input {...register("phone")} dir="ltr" />
            </FormField>
            <FormField
              label={t("setup.email")}
              required
              error={
                errors.email?.message === "emailInvalid"
                  ? t("setup.emailInvalid")
                  : errors.email?.message === "email"
                    ? t("setup.emailRequired")
                    : undefined
              }
            >
              <Input {...register("email")} type="email" dir="ltr" />
            </FormField>
          </div>
          <FormField label={t("setup.logo")} hint={t("setup.logoHelp")}>
            <ImageUpload kind="logo" value={logoUrl} onChange={setLogoUrl} helperText={t("setup.logoHelp")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeading>{t("setup.contactLegal")}</SectionHeading>
        <Separator className="my-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t("setup.ice")}
            required
            error={
              errors.ice?.message === "iceRequired"
                ? t("setup.iceRequired")
                : errors.ice?.message === "iceInvalid"
                  ? t("setup.iceInvalid")
                  : undefined
            }
          >
            <Input {...register("ice")} dir="ltr" />
          </FormField>
          <FormField label={t("setup.rlc")}>
            <Input {...register("rlc")} dir="ltr" />
          </FormField>
          <FormField label={t("setup.ifNumber")}>
            <Input {...register("if_number")} dir="ltr" />
          </FormField>
          <FormField label={t("setup.secteur")}>
            <Input {...register("secteur")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {t("setup.save")}
        </Button>
      </div>
      {isSetup && (
        <p className="text-center text-xs text-muted-foreground">
          {t("setup.subtitle")}
        </p>
      )}
    </form>
  );
}