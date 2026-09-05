"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

const schema = z
  .object({
    newPassword: z.string().min(8, { message: "tooShort" }),
    confirm: z.string().min(8, { message: "tooShort" }),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "mismatch",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  async function onSubmit(values: Values) {
    setLoading(true);
    const { data: userData, error: updateError } =
      await supabase.auth.updateUser({ password: values.newPassword });
    setLoading(false);

    if (updateError || !userData.user) {
      toast.error(t("toasts.error"));
      return;
    }

    // Turn off the forced-change flag now that the password is updated.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", userData.user.id);

    if (profileError) {
      toast.error(t("toasts.error"));
      return;
    }

    toast.success(t("changePassword.success"));
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-navy">{t("changePassword.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("changePassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t("changePassword.newPassword")}
          required
          error={
            errors.newPassword?.message === "tooShort"
              ? t("changePassword.passwordTooShort")
              : undefined
          }
        >
          <Input
            type="password"
            autoComplete="new-password"
            className="text-start"
            {...register("newPassword")}
          />
        </FormField>

        <FormField
          label={t("changePassword.confirmNewPassword")}
          required
          error={
            errors.confirm?.message === "mismatch"
              ? t("changePassword.mustMatch")
              : errors.confirm?.message === "tooShort"
                ? t("changePassword.passwordTooShort")
                : undefined
          }
        >
          <Input
            type="password"
            autoComplete="new-password"
            className="text-start"
            {...register("confirm")}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {t("changePassword.change")}
        </Button>
      </form>
    </div>
  );
}