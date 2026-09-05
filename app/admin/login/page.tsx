import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { createClient } from "@/lib/supabase/server";

// Public login page for the landing site ("Espace Administration") and the
// SINGLE official entry point to the Admin Dashboard.
// Since it lives outside the (admin) route group, it is NOT guarded by
// requireAdminUser — plain credentials sign-in, same as /login.
// Middleware redirects an already-authenticated admin away from here; the
// check below is an extra server-side guard so the form is never shown twice.

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const locale = getLocale();
  const t = getT(locale);

  const supabase = createClient();

  // If an admin is already signed in, skip the form and go straight to the
  // Admin Dashboard (canonical: /admin -> /admin/dashboard).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: "admin" | "admin_cooperative" | null }>();
    if (profile?.role === "admin") redirect("/admin");
  }

  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "logo_url")
    .maybeSingle<{ key: string; value: string }>();
  const logo = data?.value || null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0D9488] to-[#0B1224] p-4">
      <div className="flex w-full max-w-md justify-end">
        <LocaleSwitcher compact />
      </div>

      <LoginForm variant="admin" logoUrl={logo} />

      <Link
        href="/"
        className="text-sm font-semibold text-slate-200 transition-colors hover:text-white hover:underline"
      >
        {t("landing.backToSite")}
      </Link>
      <p className="text-center text-sm text-slate-300">
        © {new Date().getFullYear()} {t("landing.brand")}. Plateforme de gestion.
      </p>
    </div>
  );
}
