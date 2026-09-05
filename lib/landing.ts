// Server-side data access for the public landing site ("Taawonyati").
// All content lives in Supabase (see sql/20_landing_site.sql) and is readable
// by anonymous visitors (RLS: SELECT true).
// NOTE: `cache()` was removed — only the layout calls this function, and the
// wrapper was hiding stale data from the browser after admin edits.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { MOCKUP_SLOTS } from "@/lib/types";
import type {
  DesignerCard,
  LandingFeature,
  LandingHeroText,
  LandingMedia,
  LandingScreenshot,
  MockupSlotKey,
  PricingPlan,
  SocialLink,
  SiteSetting,
} from "@/lib/types";

export interface LandingHeroData {
  title: string;
  highlighted_word: string;
  subtitle: string;
}

export interface LandingSettings {
  whatsappNumber: string | null;
  appLink: string | null;
  webAppLink: string | null;
  gmailAddress: string | null;
  logoUrl: string | null;
}

export interface LandingContent {
  hero: LandingHeroData | null;
  galleryScreenshots: LandingScreenshot[];
  mockups: Record<MockupSlotKey, string | null>;
  features: LandingFeature[];
  monthlyPlan: PricingPlan | null;
  annualPlan: PricingPlan | null;
  social: Record<string, string>;
  settings: LandingSettings;
  designerCard: DesignerCard | null;
}

function mediaByKey(rows: LandingMedia[]): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const row of rows) map[row.key] = row.image_url || null;
  return map;
}

function settingsByKey(rows: SiteSetting[]): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const row of rows) map[row.key] = row.value || null;
  return map;
}

export async function getLandingContent(): Promise<LandingContent> {
  void cookies();
  const supabase = createClient();

  const [mediaRes, heroRes, featuresRes, plansRes, socialRes, settingsRes, screenshotsRes, designerRes] =
    await Promise.all([
      supabase
        .from("landing_media")
        .select("*")
        .returns<LandingMedia[]>(),
      supabase
        .from("landing_hero_text")
        .select("*")
        .limit(1)
        .maybeSingle<LandingHeroText>(),
      supabase
        .from("landing_features")
        .select("*")
        .order("sort_order", { ascending: true })
        .returns<LandingFeature[]>(),
      supabase
        .from("pricing_plans")
        .select("*")
        .returns<PricingPlan[]>(),
      supabase
        .from("social_links")
        .select("*")
        .returns<SocialLink[]>(),
      supabase
        .from("site_settings")
        .select("*")
        .returns<SiteSetting[]>(),
      supabase
        .from("landing_screenshots")
        .select("*")
        .order("sort_order", { ascending: true })
        .returns<LandingScreenshot[]>(),
      supabase
        .from("designer_card")
        .select("*")
        .limit(1)
        .maybeSingle<DesignerCard>(),
    ]);

  const media = mediaByKey(mediaRes.data ?? []);
  const settingsMap = settingsByKey(settingsRes.data ?? []);

  const plans: PricingPlan[] = plansRes.data ?? [];
  const social: Record<string, string> = {};
  for (const s of socialRes.data ?? []) social[s.platform] = s.url;

  const hero = heroRes.data
    ? {
        title: heroRes.data.title,
        highlighted_word: heroRes.data.highlighted_word,
        subtitle: heroRes.data.subtitle,
      }
    : null;

  const mockups = {} as Record<MockupSlotKey, string | null>;
  for (const slot of MOCKUP_SLOTS) {
    mockups[slot] = media[slot] ?? null;
  }

  return {
    hero,
    galleryScreenshots: screenshotsRes.data ?? [],
    mockups,
    features: featuresRes.data ?? [],
    monthlyPlan: plans.find((p) => p.plan_type === "monthly") ?? null,
    annualPlan: plans.find((p) => p.plan_type === "annual") ?? null,
    social,
    settings: {
      whatsappNumber: settingsMap["whatsapp_number"],
      appLink: settingsMap["app_download_url"] ?? settingsMap["app_link"],
      webAppLink: settingsMap["web_app_link"] || "/login",
      gmailAddress: settingsMap["gmail_address"] ?? settingsMap["email"],
      logoUrl: settingsMap["logo_url"],
    },
    designerCard: designerRes.data ?? null,
  };
}
