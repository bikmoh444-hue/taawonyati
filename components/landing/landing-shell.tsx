"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LandingContent, LandingHeroData, LandingSettings } from "@/lib/landing";
import type { DesignerCard, LandingScreenshot, MockupSlotKey, PricingPlan } from "@/lib/types";
import { LandingHeader } from "./landing-header";
import { LandingFooter } from "./landing-footer";

interface LandingContextValue {
  galleryScreenshots: LandingScreenshot[];
  hero: LandingHeroData | null;
  mockups: Record<MockupSlotKey, string | null>;
  designerCard: DesignerCard | null;
  settings: LandingSettings;
  social: Record<string, string>;
  monthlyPlan: PricingPlan | null;
  annualPlan: PricingPlan | null;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside <LandingShell>");
  return ctx;
}

export function LandingShell({
  role,
  content,
  children,
}: {
  role: "admin" | "cooperative" | null;
  content: LandingContent;
  children: ReactNode;
}) {
  return (
    <LandingContext.Provider
      value={{
        galleryScreenshots: content.galleryScreenshots,
        hero: content.hero,
        mockups: content.mockups,
        designerCard: content.designerCard,
        settings: content.settings,
        social: content.social,
        monthlyPlan: content.monthlyPlan,
        annualPlan: content.annualPlan,
      }}
    >
      <div className="flex min-h-screen scroll-smooth flex-col bg-white">
        <LandingHeader role={role} content={content} />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    </LandingContext.Provider>
  );
}
