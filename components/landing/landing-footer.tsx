"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { SiteLogo } from "./site-logo";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useLanding } from "./landing-shell";

const SOCIAL_ICONS = [
  { icon: Instagram, label: "Instagram", key: "instagram" },
  { icon: Facebook, label: "Facebook", key: "facebook" },
  { icon: Twitter, label: "X", key: "twitter" },
  { icon: Linkedin, label: "LinkedIn", key: "linkedin" },
] as const;

export function LandingFooter() {
  const { t } = useI18n();
  const { social, settings } = useLanding();

  const navItems = [
    [t("landing.navHome"), "/"],
    [t("landing.navFeatures"), "/fonctionnalites"],
    [t("landing.navPricing"), "/fonctionnalites#tarifs"],
    [t("landing.navContact"), "/#contact"],
  ] as const;

  return (
    <footer className="bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <SiteLogo
              src={settings.logoUrl}
              alt="taawoniati"
              showWordmark
              className="[&_span:last-child]:text-white"
            />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t("landing.footerDesc")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-[#A8E6DC]">{t("landing.footerNav")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navItems.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 transition-colors hover:text-[#A8E6DC]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-bold text-[#A8E6DC]">{t("landing.footerResources")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                [t("landing.footerGuides"), "#"],
                [t("landing.footerHelp"), "#"],
                [t("landing.footerCommunity"), "#"],
                [t("landing.footerCompliance"), "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-400 transition-colors hover:text-[#A8E6DC]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connectivité */}
          <div>
            <h4 className="text-sm font-bold text-[#A8E6DC]">{t("landing.footerConnectivity")}</h4>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t("landing.footerConnectivityDesc")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {SOCIAL_ICONS.map(({ icon: Icon, label, key }) => {
                const href = social[key] || "#";
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-200 transition-colors hover:bg-[#0D9488] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Sinshin. {t("landing.footerCopyright")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="#" className="text-slate-400 transition-colors hover:text-[#A8E6DC]">
              {t("landing.footerLegal")}
            </Link>
            <Link href="#" className="text-slate-400 transition-colors hover:text-[#A8E6DC]">
              {t("landing.footerPrivacy")}
            </Link>
            <Link href="#" className="text-slate-400 transition-colors hover:text-[#A8E6DC]">
              {t("landing.footerCgv")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
