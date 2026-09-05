import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "logo_url")
    .maybeSingle<{ key: string; value: string }>();
  const logo = data?.value || null;

  return <LoginForm logoUrl={logo} />;
}
