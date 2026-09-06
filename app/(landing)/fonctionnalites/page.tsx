import type { Metadata } from "next";
import { DesignerSection } from "@/components/landing/designer-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Fonctionnalités & Tarifs — Taawoniati",
  description:
    "Tout ce dont votre coopérative a besoin : documents, finances, clients, activités. Choisissez votre formule.",
};

export default function LandingFeaturesPage() {
  return (
    <>
      <FeaturesSection />
      <PricingSection />
      <DesignerSection />
    </>
  );
}
