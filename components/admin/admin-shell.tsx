"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FolderCog, Globe, LayoutDashboard, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/landing/site-logo";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_settings")
      .select("key,value")
      .eq("key", "logo_url")
      .maybeSingle<{ key: string; value: string }>()
      .then(({ data }) => {
        if (!cancelled) setLogoUrl(data?.value || null);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const path = typeof window !== "undefined" ? window.location.pathname : "";

  const navItems = [
    { href: "/admin/dashboard", label: t("admin.dashboard"), icon: LayoutDashboard },
    { href: "/admin/cooperatives", label: t("admin.accounts"), icon: Building2 },
    { href: "/admin/presentation", label: "Presentation", icon: Globe },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-soft">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-xl px-1.5 py-1">
              <SiteLogo src={logoUrl} alt="Taawonyati" showWordmark={false} />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-navy">Taawonyati</p>
              <p className="text-[11px] text-muted-foreground">Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Button type="button" variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col gap-1 border-e border-border/60 bg-white p-4 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors",
                path === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-soft"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          <div className="mt-auto" />
          <a
            href="/setup"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-soft"
          >
            <FolderCog className="h-4 w-4" />
            {t("common.more")}
          </a>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>

      {/* Mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border/60 bg-white lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            type="button"
            onClick={() => router.push(href)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
              path === href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
