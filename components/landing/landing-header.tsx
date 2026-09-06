"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LandingContent } from "@/lib/landing";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SiteLogo } from "./site-logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", labelKey: "landing.navHome" },
  { href: "/fonctionnalites", labelKey: "landing.navFeatures" },
  { href: "/fonctionnalites#tarifs", labelKey: "landing.navPricing" },
  { href: "/#contact", labelKey: "landing.navContact" },
] as const;

export function LandingHeader({
  role,
  content,
}: {
  role: "admin" | "cooperative" | null;
  content: LandingContent;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const ctaHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "cooperative"
        ? "/dashboard"
        : "/admin/login";
  const ctaLabel = role ? t("landing.goToDashboard") : t("landing.signIn");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" aria-label={t("landing.brand")}>
          <SiteLogo
            src={content.settings.logoUrl}
            alt={t("landing.brand")}
            iconClassName="h-7 w-7 rounded-md"
            className="gap-2"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const activePath = item.href.split("#")[0];
            const currentPath = pathname === "" ? "/" : pathname;
            const active =
              item.href === "/fonctionnalites#tarifs"
                ? false
                : activePath === currentPath;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-[#0D9488] after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[2px] after:rounded-full after:content-['']",
                  active
                    ? "text-[#0D9488] after:bg-[#0D9488]"
                    : "after:bg-transparent"
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <LocaleSwitcher compact />
          <a
            href={content.settings.appLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border-2 border-[#0D9488] bg-white px-4 py-1.5 text-[13px] font-bold text-[#0D9488] transition-all hover:bg-[#F0FDFA] sm:inline-flex"
          >
            {t("landing.downloadApp")}
          </a>
          <Link
            href={ctaHref}
            className="hidden rounded-full bg-[#0D9488] px-5 py-2 text-[13px] font-bold text-white shadow-sm shadow-[#0D9488]/20 transition-all hover:bg-[#0F766E] hover:shadow sm:inline-flex"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-[#0D9488] md:hidden"
            aria-label={t("common.menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <a
              href={content.settings.appLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg border-2 border-[#0D9488] px-3 py-2.5 text-center text-sm font-bold text-[#0D9488] hover:bg-[#F0FDFA]"
            >
              {t("landing.downloadApp")}
            </a>
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-[#0D9488] px-3 py-2.5 text-center text-sm font-bold text-white"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
