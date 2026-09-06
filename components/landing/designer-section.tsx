"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Dribbble,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLanding } from "./landing-shell";
import type { OwnerCompanyCard } from "@/lib/types";

export function DesignerSection() {
  const { t } = useI18n();
  const { designerCard, ownerCompanyCard } = useLanding();

  const name = designerCard?.name || "—";
  const role = designerCard?.role || t("landing.designerRoleFallback");
  const bio = designerCard?.bio || t("landing.designerBio");
  const avatar = designerCard?.avatar_url || null;
  const whatsapp = designerCard?.whatsapp_link || null;
  const email = designerCard?.email || null;
  const portfolio = designerCard?.portfolio_link || null;

  const societe: OwnerCompanyCard | null = ownerCompanyCard?.is_active ? ownerCompanyCard : null;

  const socials = [
    { icon: Instagram, label: "Instagram", href: designerCard?.social_instagram },
    { icon: Facebook, label: "Facebook", href: designerCard?.social_facebook },
    { icon: Twitter, label: "X", href: designerCard?.social_twitter },
    { icon: Dribbble, label: "Dribbble", href: designerCard?.social_dribbble },
  ].filter((s) => !!s.href);

return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <header className="text-center">
          <h2 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
            {t("landing.designerTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t("landing.designerSubtitle")}
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Société card */}
            {societe && (
              <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-center text-white shadow-[0_30px_70px_-30px_rgba(11,18,36,0.65)] sm:p-12">
                <div>
                  <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-[#0D9488]/50 bg-[#1B2541] text-[#A8E6DC]">
                    {societe.logo_url ? (
                      <Image
                        src={societe.logo_url}
                        alt={societe.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-14 w-14"
                        aria-hidden
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="4.5" />
                        <path d="M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
                    {societe.name}
                  </h3>
                  <p className="mt-1.5 text-sm font-bold uppercase tracking-wide text-[#0D9488]">
                    {societe.subtitle}
                  </p>

                  <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
                    {societe.description}
                  </p>
                </div>

                <div>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    {societe.whatsapp && (
                      <a
                        href={societe.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0F766E]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {t("landing.designerWhatsApp")}
                      </a>
                    )}
                    {societe.email && (
                      <a
                        href={`mailto:${societe.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:border-[#0D9488]/60 hover:bg-white/10"
                      >
                        <Mail className="h-4 w-4" />
                        {t("landing.designerEmail")}
                      </a>
                    )}
                    {societe.website_url && (
                      <a
                        href={societe.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:border-[#0D9488]/60 hover:bg-white/10"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        {t("landing.designerPortfolio")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Designer card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-center text-white shadow-[0_30px_70px_-30px_rgba(11,18,36,0.65)] sm:p-12">
            <div>
              <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-[#0D9488]/50 bg-[#1B2541] text-[#A8E6DC]">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-14 w-14"
                    aria-hidden
                  >
                    <circle cx="12" cy="8" r="4.5" />
                    <path d="M4.5 20c.8-3.4 3.7-5.5 7.5-5.5s6.7 2.1 7.5 5.5" />
                  </svg>
                )}
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
                {name}
              </h3>
              <p className="mt-1.5 text-sm font-bold uppercase tracking-wide text-[#0D9488]">
                {role}
              </p>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
                {bio}
              </p>
            </div>

            <div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0F766E]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("landing.designerWhatsApp")}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:border-[#0D9488]/60 hover:bg-white/10"
                  >
                    <Mail className="h-4 w-4" />
                    {t("landing.designerEmail")}
                  </a>
                )}
                {portfolio && (
                  <a
                    href={portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:border-[#0D9488]/60 hover:bg-white/10"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    {t("landing.designerPortfolio")}
                  </a>
                )}
              </div>

              {socials.length > 0 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-slate-200 transition-colors hover:bg-[#0D9488] hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
