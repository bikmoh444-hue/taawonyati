import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Cooperative, Profile } from "@/lib/types";

export interface SessionData {
  userId: string;
  profile: Profile;
  cooperative: Cooperative | null;
}

// Fetch the authenticated user + their profile (server-side, RLS-protected).
// Redirects to `loginPath` when there is no session (middleware covers this
// too, but this is a server-side guard so the page never renders without a
// session). Defaults to the cooperative login; admin callers pass /admin/login.
export async function requireSession(
  loginPath: string = "/login"
): Promise<SessionData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(loginPath);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) redirect(loginPath);

  let cooperative: Cooperative | null = null;
  if (profile.cooperative_id) {
    const { data: coop } = await supabase
      .from("cooperatives")
      .select("*")
      .eq("id", profile.cooperative_id)
      .maybeSingle();
    cooperative = (coop as Cooperative) ?? null;
  }

  return { userId: user.id, profile: profile as Profile, cooperative };
}

// Cooperative users only (blocks admins).
export async function requireCooperativeUser(): Promise<SessionData> {
  const session = await requireSession();
  if (session.profile.role !== "admin_cooperative") redirect("/admin/dashboard");
  if (!session.cooperative) redirect("/setup");
  return session;
}

// Admin users only (blocks cooperative users).
export async function requireAdminUser(): Promise<SessionData> {
  const session = await requireSession("/admin/login");
  if (session.profile.role !== "admin") redirect("/");
  return session;
}