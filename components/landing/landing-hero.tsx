"use client";

import {
  ArrowRight,
  BadgeCheck,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLanding } from "./landing-shell";
import { DesktopMockup } from "./mockups";

export function LandingHero() {
  const { mockups, hero, settings } = useLanding();
  const { t } = useI18n();

  const heroTitle = hero?.title ?? t("landing.heroTitleFallback");
  const heroHighlight =
    hero?.highlighted_word ?? t("landing.heroHighlightFallback");
  const heroSubtitle = hero?.subtitle ?? t("landing.heroSubtitleFallback");

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,#E6F4F1_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1fr_1.15fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-[#0F766E]">
            <SparklesBadge />
            {t("landing.heroBadge")}
          </span>

          <h1 className="mt-5 text-[32px] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] sm:text-4xl lg:text-[42px]">
            {heroTitle}{" "}
            <span className="text-[#0D9488]">{heroHighlight}</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            {heroSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="/admin/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0D9488]/25 transition-all hover:bg-[#0F766E] hover:shadow-xl hover:shadow-[#0F766E]/25"
            >
              <Monitor className="h-4 w-4" />
              {t("landing.goToSite")}
              <ArrowRight className="h-4 w-4 transition-transform rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </a>
            <a
              href={settings.appLink || "#"}
              className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0F172A]/20 transition-all hover:bg-[#1e293b]"
            >
              <Smartphone className="h-4 w-4 text-[#A8E6DC]" />
              {t("landing.goToApp")}
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <BadgeCheck className="h-4 w-4 text-[#0D9488]" />
              {t("landing.heroTrust1")}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
              {t("landing.heroTrust2")}
            </span>
          </div>
        </div>

        <HeroVisual src={mockups.hero_dashboard} />
      </div>
    </section>
  );
}

function HeroVisual({
  src,
}: {
  src: string | null;
}) {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[560px] md:max-w-[640px]">
      <DesktopMockup
        src={src}
        alt={t("landing.heroVisualAlt")}
        urlText="https://sinshin.com/dashboard"
        fallback={
          <div className="grid h-full w-full place-items-center bg-[#F4F7F6]">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E6F4F1] text-[#0D9488]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-7 w-7"
                  aria-hidden
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">
                  {t("landing.heroScreenshotAddHint")}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {t("landing.heroScreenshotHint")}
                </p>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

function SparklesBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5 text-[#0D9488]"
      aria-hidden
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </svg>
  );
}