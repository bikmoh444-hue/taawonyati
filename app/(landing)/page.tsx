import type { Metadata } from "next";
import { AccessSection } from "@/components/landing/access-section";
import { ContactSection } from "@/components/landing/contact-section";
import { DesignerSection } from "@/components/landing/designer-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingHero } from "@/components/landing/landing-hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { getLocale, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(getLocale());
  return {
    title: t("landing.metaTitle"),
    description: t("landing.metaDescription"),
  };
}

export default function LandingHomePage() {
  return (
    <>
      <LandingHero />
      <AccessSection />
      <FeaturesSection />
      <PricingSection />
      <ContactSection />
      <DesignerSection />
    </>
  );
}
