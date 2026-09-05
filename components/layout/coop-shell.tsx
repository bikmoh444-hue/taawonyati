"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { LocaleSwitcher } from "./locale-switcher";
import type { Cooperative, Profile } from "@/lib/types";

const TITLES: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/documents": "nav.documents",
  "/products": "nav.products",
  "/financials/expenses": "nav.expenses",
  "/financials/revenus": "nav.incomes",
  "/financials": "nav.financials",
  "/activities": "nav.activities",
  "/clients": "nav.clients",
  "/suppliers": "nav.suppliers",
  "/settings": "nav.settings",
  "/trash": "nav.trash",
  "/support": "nav.support",
  "/about": "nav.about",
};

function pageTitleKey(pathname: string): string {
  for (const [prefix, key] of Object.entries(TITLES)) {
    if (pathname.startsWith(prefix)) return key;
  }
  return "nav.dashboard";
}

export function CoopShell({
  profile,
  cooperative,
  children,
}: {
  profile: Profile;
  cooperative: Cooperative | null;
  children: React.ReactNode;
}) {
  const { t, dir } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Physical side for the mobile drawer — mirrored for RTL.
  const drawerSide = dir === "rtl" ? "right" : "left";

  const coopName =
    cooperative?.name_fr || cooperative?.name_ar || profile.full_name || "Taawonyati";

  function title() {
    return t(pageTitleKey(pathname));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-border bg-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-5">
          {cooperative?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cooperative.logo_url}
              alt={coopName}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
              {initials(coopName) || "G"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-navy">{coopName}</p>
            <p className="text-xs text-muted-foreground">{t("common.appName")}</p>
          </div>
        </div>
        <SidebarNav coopName={coopName} fullName={profile.full_name} />
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:ps-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-soft/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={drawerSide} className="flex w-72 flex-col p-0">
                <SheetTitle className="px-6 pt-6 text-lg font-bold text-navy">
                  {coopName}
                </SheetTitle>
                <SidebarNav
                  coopName={coopName}
                  fullName={profile.full_name}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-navy lg:text-xl">
              {title()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow"
                >
                  {initials(profile.full_name || "U") || "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="font-bold">{profile.full_name || "--"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/change-password">
                    {t("changePassword.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}