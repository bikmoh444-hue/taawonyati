"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MoreHorizontal,
  Package,
  Settings,
  Trash2,
  Truck,
  TrendingDown,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleSwitcher } from "./locale-switcher";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  exact?: boolean;
}

export function SidebarNav({
  coopName,
  fullName,
  onNavigate,
}: {
  coopName?: string | null;
  fullName?: string | null;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const mainItems: NavItem[] = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
    { href: "/documents", labelKey: "nav.documents", icon: FileText },
    { href: "/products", labelKey: "nav.products", icon: Package },
    { href: "/financials/expenses", labelKey: "nav.expenses", icon: TrendingDown },
    { href: "/financials/revenus", labelKey: "nav.incomes", icon: TrendingUp },
    { href: "/activities", labelKey: "nav.activities", icon: CalendarDays },
    { href: "/clients", labelKey: "nav.clients", icon: Users },
    { href: "/suppliers", labelKey: "nav.suppliers", icon: Truck },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navLink = (
    item: NavItem,
    size: "md" | "sm" = "md"
  ) => {
    const Icon = item.icon;
    const active = isActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-2xl font-medium transition-colors",
          size === "md" ? "px-4 py-3 text-sm" : "px-3 py-2 text-sm",
          active
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {t(item.labelKey as never)}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      <div className="flex justify-end lg:hidden">
        <LocaleSwitcher />
      </div>
      {mainItems.map((i) => navLink(i))}

      <div className="mt-auto flex flex-col gap-2 pt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
              {t("common.more")}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {coopName || t("common.appName")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNavigate} asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNavigate} asChild>
              <Link href="/trash">
                <Trash2 className="h-4 w-4" />
                {t("nav.trash")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNavigate} asChild>
              <Link href="/support">
                <LifeBuoy className="h-4 w-4" />
                {t("nav.support")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNavigate} asChild>
              <Link href="/about">
                <Info className="h-4 w-4" />
                {t("nav.about")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4" />
              {t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}