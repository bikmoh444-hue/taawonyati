import type { Metadata } from "next";
import { AccessSection } from "@/components/landing/access-section";
import { ContactSection } from "@/components/landing/contact-section";
import { DesignerSection } from "@/components/landing/designer-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingHero } from "@/components/landing/landing-hero";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Taawoniati - Gestion des cooperatives",
  description:
    "Application web et mobile pour simplifier la gestion des cooperatives.",
};

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
