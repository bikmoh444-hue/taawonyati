"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Handshake, Loader2, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { EMAIL_REGEX } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SiteLogo } from "@/components/landing/site-logo";

const loginSchema = z.object({
  email: z
    .string()
    .min(1)
    .regex(EMAIL_REGEX, { message: "invalid" }),
  password: z.string().min(8, { message: "tooShort" }),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  variant = "default",
  logoUrl = null,
}: {
  variant?: "default" | "admin";
  logoUrl?: string | null;
}) {
  const { t, dir } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      setError("email", { message: "credentials" });
      setError("password", { message: "credentials" });
      return;
    }

    // Redirect based on which login this is. The admin variant is the single
    // official entry to the Admin Dashboard; the default variant routes into
    // the cooperative app. After sign-in the middleware resolves the final
    // destination (setup / change-password / dashboard) from the live session.
    router.push(variant === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  const invalidCredentials = errors.email?.message === "credentials";
  const isAdmin = variant === "admin";

  return (
    <div className={isAdmin ? "w-full max-w-md rounded-[20px] bg-white p-8 shadow-2xl" : "w-full max-w-md rounded-3xl bg-white p-8 shadow-lg"}>
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        {isAdmin ? (
          <div className="flex rounded-2xl bg-slate-50 px-5 py-3.5">
            <SiteLogo
              src={logoUrl}
              alt={t("landing.brand")}
              showWordmark
              className="[&_span:last-child]:text-[#111827]"
            />
          </div>
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0F5F55] text-white">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={t("landing.brand")}
                className="h-12 w-12 rounded-full object-contain"
              />
            ) : (
              <Handshake className="h-8 w-8" />
            )}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-navy">
            {isAdmin ? t("landing.loginPageTitle") : t("auth.loginTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Connectez-vous pour gérer votre coopérative" : t("auth.loginSubtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t("auth.email")}
          required
          error={
            errors.email?.message === "invalid"
              ? t("auth.invalidEmail")
              : undefined
          }
        >
          <div className="relative">
            <Input
              type="email"
              autoComplete="email"
              placeholder={isAdmin ? "admin@sinshin.ma" : t("auth.emailPlaceholder")}
              className={isAdmin ? "rounded-lg bg-white pe-12 ps-11" : "pe-12"}
              {...register("email")}
            />
            <Mail className={isAdmin ? "absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" : "absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"} />
          </div>
        </FormField>

        <FormField
          label={t("auth.password")}
          required
          error={
            errors.password?.message === "tooShort"
              ? t("auth.passwordTooShort")
              : undefined
          }
        >
          <div className="relative">
            <Input
              type="password"
              autoComplete="current-password"
              placeholder={isAdmin ? "••••••••" : t("auth.passwordPlaceholder")}
              className={isAdmin ? "rounded-lg bg-white pe-12 ps-11" : "pe-12"}
              {...register("password")}
            />
            <LockKeyhole className={isAdmin ? "absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" : "absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"} />
          </div>
        </FormField>

        {isAdmin && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              Se souvenir de moi
            </label>
            <Link href="/login" className="font-semibold text-[#0D9488] hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        {invalidCredentials && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {t("auth.invalidCredentials")}
          </p>
        )}

        <Button
          type="submit"
          className={isAdmin ? "w-full rounded-lg bg-[#0D9488] hover:bg-[#0F766E]" : "w-full"}
          size="lg"
          disabled={loading}
          dir={dir}
        >
          {loading && <Loader2 className="animate-spin" />}
          {t("auth.signIn")}
        </Button>
      </form>
    </div>
  );
}
