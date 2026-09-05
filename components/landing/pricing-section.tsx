"use client";

import { Check, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-shell";

function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR");
}

function buildWaHref(number: string, message: string | null): string {
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  const params = new URLSearchParams({ text: message });
  return `${base}?${params.toString()}`;
}

export function PricingSection() {
  const { t } = useI18n();
  const { settings, monthlyPlan, annualPlan } = useLanding();
  const waNumber = settings.whatsappNumber?.replace(/[^0-9]/g, "") || "";

  const monthly = monthlyPlan;
  const annual = annualPlan;

  return (
    <section id="tarifs" className="scroll-mt-20 bg-slate-50 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            {t("landing.pricingBadge")}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            {t("landing.pricingTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            {t("landing.pricingSubtitle")}
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
          <PlanCard
            badge={monthly?.badge ?? t("landing.pricingNoCommitmentBadge")}
            badgeClass="bg-[#E6F4F1] text-[#0F766E]"
            title={t("landing.planMonthly")}
            price={monthly ? formatPrice(monthly.price) : "—"}
            per={t("landing.perMonth")}
            features={monthly?.features ?? []}
            checkClass="bg-slate-200 text-slate-600"
            buttonLabel={t("landing.contactWhatsApp")}
            buttonClass="border-2 border-[#0D9488] bg-white text-[#0F766E] hover:bg-[#F0FDFA]"
            whatsappHref={buildWaHref(waNumber, monthly?.whatsapp_message ?? null)}
            dark={false}
            featured={monthly?.is_featured ?? false}
          />

          <PlanCard
            badge={annual?.badge ?? t("landing.pricingRecommendedBadge")}
            badgeClass="bg-[#0D9488] text-white"
            title={t("landing.planAnnual")}
            price={annual ? formatPrice(annual.price) : "—"}
            per={t("landing.perYear")}
            features={annual?.features ?? []}
            checkClass="bg-[#0D9488]/25 text-[#A8E6DC]"
            buttonLabel={t("landing.subscribeWhatsApp")}
            buttonClass="bg-[#0D9488] text-white hover:bg-[#0F766E]"
            dark={annual?.is_featured ?? true}
            featured={annual?.is_featured ?? true}
            whatsappHref={buildWaHref(waNumber, annual?.whatsapp_message ?? null)}
          />
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  badge,
  badgeClass,
  title,
  price,
  per,
  features,
  checkClass,
  buttonLabel,
  buttonClass,
  dark = false,
  featured = false,
  whatsappHref = "https://wa.me",
}: {
  badge: string;
  badgeClass: string;
  title: string;
  price: string;
  per: string;
  features: string[];
  checkClass: string;
  buttonLabel: string;
  buttonClass: string;
  dark?: boolean;
  featured?: boolean;
  whatsappHref?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl p-6",
        featured
          ? "border border-[#0F172A]/90 bg-[#0F172A] text-white shadow-[0_35px_70px_-30px_rgba(11,18,36,0.6)]"
          : "border border-slate-200 bg-white text-[#0F172A] shadow-[0_20px_50px_-25px_rgba(15,23,42,0.2)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            badgeClass
          )}
        >
          {badge}
        </span>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span
          className={cn(
            "text-5xl font-extrabold tracking-tight",
            dark ? "text-[#A8E6DC]" : "text-[#0D9488]"
          )}
        >
          {price}
        </span>
        <span className={cn("mb-1.5 text-sm font-bold", dark ? "text-slate-300" : "text-slate-600")}>
          MAD <span className="text-sm font-medium opacity-70">{per}</span>
        </span>
      </div>

      <div className={cn("mt-7 h-px w-full", dark ? "bg-white/15" : "bg-slate-200")} />

      <ul className="mt-7 flex-1 space-y-3.5 text-sm">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                checkClass
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className={cn(dark ? "text-slate-200" : "text-slate-600")}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors",
          buttonClass
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {buttonLabel}
      </a>
    </div>
  );
}