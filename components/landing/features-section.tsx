"use client";

import {
  ClipboardList,
  FileText,
  Globe,
  Handshake,
  Package,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CARD_COLORS = [
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-violet-50", text: "text-violet-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
] as const;

export function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    {
      icon: FileText,
      title: t("landing.featuresItem1Title"),
      description: t("landing.featuresItem1Desc"),
    },
    {
      icon: Package,
      title: t("landing.featuresItem2Title"),
      description: t("landing.featuresItem2Desc"),
    },
    {
      icon: Wallet,
      title: t("landing.featuresItem3Title"),
      description: t("landing.featuresItem3Desc"),
    },
    {
      icon: Handshake,
      title: t("landing.featuresItem4Title"),
      description: t("landing.featuresItem4Desc"),
    },
    {
      icon: ClipboardList,
      title: t("landing.featuresItem5Title"),
      description: t("landing.featuresItem5Desc"),
    },
    {
      icon: Globe,
      title: t("landing.featuresItem6Title"),
      description: t("landing.featuresItem6Desc"),
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            {t("landing.featuresBadge")}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            {t("landing.featuresTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            {t("landing.featuresSubtitle")}
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, i) => {
            const colors = CARD_COLORS[i];
            return (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0D9488]/25 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${colors.bg} ${colors.text}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[17px] font-bold tracking-tight text-[#0F172A]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
