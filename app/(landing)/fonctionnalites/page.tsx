import type { Metadata } from "next";
import { DesignerSection } from "@/components/landing/designer-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { getLocale, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(getLocale());
  return {
    title: t("landing.metaFeaturesTitle"),
    description: t("landing.metaDescriptionFeatures"),
  };
}

export default function LandingFeaturesPage() {
  return (
    <>
      <FeaturesSection />
      <PricingSection />
      <DesignerSection />
    </>
  );
}
