"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useLanding } from "./landing-shell";
import { DesktopMockup, PhoneMockup } from "./mockups";
import type { LandingScreenshot } from "@/lib/types";

function ScreenshotCarousel({
  screenshots,
  categoryLabel,
  fallbackLabel,
  variant = "mobile",
}: {
  screenshots: LandingScreenshot[];
  categoryLabel: string;
  fallbackLabel: string;
  variant?: "desktop" | "mobile";
}) {
  const Mockup = variant === "desktop" ? DesktopMockup : PhoneMockup;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const scrollLeft = el.scrollLeft;
      const clientWidth = el.clientWidth;
      const scrollWidth = el.scrollWidth;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    },
    []
  );

  if (screenshots.length === 0) {
    return (
      <Mockup
        src={null}
        alt={fallbackLabel}
        fallback={
          <div className="grid h-full w-full place-items-center">
            {variant === "desktop" ? (
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
                    Ajouter une capture web depuis l&apos;admin
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Catégorie « Version Web » dans les screenshots
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#A8E6DC]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold text-slate-300">
                  {fallbackLabel}
                </p>
                <p className="text-[9px] text-slate-400">
                  Catégorie « {categoryLabel} » dans les screenshots
                </p>
              </div>
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onTouchEnd={handleTouchEnd}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-1 pb-2 scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: "none" }}
      >
        {screenshots.map((shot, idx) => (
          <div
            key={shot.id ?? idx}
            className="flex shrink-0 snap-center justify-center"
          >
            <Mockup src={shot.image_url} alt={`${categoryLabel} ${idx + 1}`} />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {screenshots.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const itemWidth = el.clientWidth / screenshots.length;
                el.scrollTo({ left: itemWidth * idx, behavior: "smooth" });
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === 0
                  ? "bg-[#0D9488] w-4"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function AccessSection() {
  const { t } = useI18n();
  const { galleryScreenshots } = useLanding();

  const webScreenshots = galleryScreenshots.filter((s) => s.category === "web");
  const appScreenshots = galleryScreenshots.filter((s) => s.category === "app");

  return (
    <section id="app" className="scroll-mt-20 bg-slate-50 py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            {t("landing.accessPlatformBadge")}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            {t("landing.accessTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            {t("landing.accessSubtitle")}
          </p>
        </header>

        {/* ---- Web & Desktop ---- */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)] sm:p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#CCFBF1] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
              {t("landing.accessWebSectionBadge")}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {t("landing.accessWebTitle")}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
              {t("landing.accessWebDesc")}
            </p>
          </div>

          {/* Web screenshots carousel */}
          {webScreenshots.length > 0 && (
            <div className="mt-8">
              <h4 className="mb-4 text-sm font-semibold text-navy">
                {t("landing.accessWebScreenshotsTitle")}
              </h4>
              <ScreenshotCarousel
                screenshots={webScreenshots}
                categoryLabel="Version Web"
                fallbackLabel="Ajouter une capture web"
                variant="desktop"
              />
            </div>
          )}

          {/* Feature chips */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FeatureChip
              icon={<LayoutDashboard className="h-4 w-4" />}
              title={t("landing.accessWebFeature1Title")}
              desc={t("landing.accessWebFeature1Desc")}
            />
            <FeatureChip
              icon={<Wallet className="h-4 w-4" />}
              title={t("landing.accessWebFeature2Title")}
              desc={t("landing.accessWebFeature2Desc")}
            />
            <FeatureChip
              icon={<FileText className="h-4 w-4" />}
              title={t("landing.accessWebFeature3Title")}
              desc={t("landing.accessWebFeature3Desc")}
            />
            <FeatureChip
              icon={<RefreshCw className="h-4 w-4" />}
              title={t("landing.accessWebFeature4Title")}
              desc={t("landing.accessWebFeature4Desc")}
            />
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-start">
            <a
              href="/admin/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0D9488]/25 transition-all hover:bg-[#0F766E] hover:shadow-xl hover:shadow-[#0F766E]/25"
            >
              {t("landing.accessWebButton")}
              <ArrowRight className="h-4 w-4 transition-transform rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* ---- Mobile block ---- */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col items-start gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#DBEAFE] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              {t("landing.accessMobileSectionBadge")}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {t("landing.accessMobileTitle")}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
              {t("landing.accessMobileDesc")}
            </p>
          </div>

          {/* Phone carousel */}
          <ScreenshotCarousel
            screenshots={appScreenshots}
            categoryLabel="Application Mobile"
            fallbackLabel="Ajouter une capture mobile"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureChip({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-[#0D9488] shadow-sm ring-1 ring-slate-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#0F172A]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
}