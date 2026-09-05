import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Redirect chain (replicates the mobile app's behavior exactly, spec §2):
// 1. No session -> /login
// 2. admin_cooperative + must_change_password -> /change-password
// 3. admin_cooperative + (cooperative_id IS NULL OR name_ar empty) -> /setup
// 4. else -> role-based home (/dashboard for coop, /admin/dashboard for admin)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public presentation site. These routes must never participate in the
  // authenticated app redirect chain.
  const isPresentationPublicPath =
    pathname === "/" || pathname === "/fonctionnalites";

  if (isPresentationPublicPath) return NextResponse.next();

  const { supabase, supabaseResponse } = updateSession(request);

  // helper: redirect while forwarding the refreshed session cookies
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const res = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie);
    }
    return res;
  };

  const isLoginPage = pathname === "/login";
  const isAdminLoginPage = pathname === "/admin/login";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Allow anonymous access to the login pages; every other route requires a
    // session. Admin routes must go to /admin/login, the rest to /login
    // (cooperative app), keeping the unified admin entry point.
    if (isLoginPage || isAdminLoginPage) return supabaseResponse;
    return redirectTo(pathname.startsWith("/admin") ? "/admin/login" : "/login");
  }

  // Authenticated: read profile (RLS-restricted to self).
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, cooperative_id, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === null) {
    return redirectTo("/login");
  }

  if (profile.role === "admin") {
    if (pathname.startsWith("/admin")) return supabaseResponse;
    if (isLoginPage || isAdminLoginPage) return redirectTo("/admin/dashboard");
    // coop routes + setup + change-password et al. -> admin home
    return redirectTo("/admin/dashboard");
  }

  // ---- role = admin_cooperative ----
  if (profile.must_change_password) {
    // Force-change password before anything else.
    if (pathname === "/change-password") return supabaseResponse;
    return redirectTo("/change-password");
  }

  let cooperativeComplete = false;
  const coopId = profile.cooperative_id;
  if (coopId) {
    const { data: coop } = await supabase
      .from("cooperatives")
      .select("name_ar")
      .eq("id", coopId)
      .maybeSingle();
    cooperativeComplete = !!coop && !!coop.name_ar && coop.name_ar.trim() !== "";
  }

  if (!cooperativeComplete) {
    // Setup not finished: allow /setup (optionally ?edit=true still honored below).
    if (pathname === "/setup") return supabaseResponse;
    return redirectTo("/setup");
  }

  // Cooperative complete.
  if (isLoginPage || isAdminLoginPage) return redirectTo("/dashboard");
  if (pathname.startsWith("/admin")) return redirectTo("/dashboard");
  if (pathname === "/setup") {
    // Manual edit allowed only via /setup?edit=true
    if (request.nextUrl.searchParams.get("edit")) return supabaseResponse;
    return redirectTo("/dashboard");
  }
  if (pathname === "/change-password") return supabaseResponse;

  // co-op app routes
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|ico)$).*)",
  ],
};
