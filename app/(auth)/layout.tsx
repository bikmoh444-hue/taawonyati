import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteLogo } from "@/components/landing/site-logo";
import { getLocale, getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "logo_url")
    .maybeSingle<{ key: string; value: string }>();
  const logo = data?.value || null;
  const locale = getLocale();
  const t = getT(locale);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#E6F7F3] via-[#F3F7F6] to-[#E9F4F1] p-4">
      <SiteLogo
        src={logo}
        alt={t("landing.brand")}
        className="mb-8 [&_span:last-child]:text-[#0F172A]"
      />
      {children}
    </div>
  );
}
