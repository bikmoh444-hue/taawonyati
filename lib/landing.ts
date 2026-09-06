// Server-side data access for the public landing site ("Sinshin").
// All content lives in Supabase (see sql/20_landing_site.sql) and is readable
// by anonymous visitors (RLS: SELECT true).
// NOTE: `cache()` was removed — only the layout calls this function, and the
// wrapper was hiding stale data from the browser after admin edits.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { MOCKUP_SLOTS } from "@/lib/types";
import type {
  DesignerCard,
  LandingFeature,
  LandingHeroText,
  LandingMedia,
  LandingScreenshot,
  MockupSlotKey,
  OwnerCompanyCard,
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
  ownerCompanyCard: OwnerCompanyCard | null;
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

// Returns the Arabic value when the locale is Arabic and the value is
// non-empty ; otherwise falls back to the French value.
function pickByLocale<T>(isArabic: boolean, fr: T, ar: T | null | undefined): T {
  if (!isArabic) return fr;
  if (ar == null) return fr;
  if (Array.isArray(ar) && (ar as unknown[]).length === 0) return fr;
  if (typeof ar === "string" && (ar as string).trim() === "") return fr;
  return ar;
}

export async function getLandingContent(): Promise<LandingContent> {
  void cookies();
  const isArabic = getLocale() === "ar";
  const supabase = createClient();

  const [mediaRes, heroRes, featuresRes, plansRes, socialRes, settingsRes, screenshotsRes, designerRes, ownerRes] =
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
      supabase
        .from("presentation_owner_company")
        .select("*")
        .limit(1)
        .maybeSingle<OwnerCompanyCard>(),
    ]);

  if (mediaRes.error) console.error("[getLandingContent] media error:", mediaRes.error);
  if (heroRes.error) console.error("[getLandingContent] hero error:", heroRes.error);
  if (featuresRes.error) console.error("[getLandingContent] features error:", featuresRes.error);
  if (plansRes.error) console.error("[getLandingContent] plans error:", plansRes.error);
  if (socialRes.error) console.error("[getLandingContent] social error:", socialRes.error);
  if (settingsRes.error) console.error("[getLandingContent] settings error:", settingsRes.error);
  if (screenshotsRes.error) console.error("[getLandingContent] screenshots error:", screenshotsRes.error);
  if (designerRes.error) console.error("[getLandingContent] designer error:", designerRes.error);
  if (ownerRes.error) console.error("[getLandingContent] owner error:", ownerRes.error);

  const media = mediaByKey(mediaRes.data ?? []);
  const settingsMap = settingsByKey(settingsRes.data ?? []);

  const plans: PricingPlan[] = plansRes.data ?? [];
  const social: Record<string, string> = {};
  for (const s of socialRes.data ?? []) social[s.platform] = s.url;

  const hero = heroRes.data
    ? {
        title: pickByLocale(isArabic, heroRes.data.title, heroRes.data.title_ar),
        highlighted_word: pickByLocale(isArabic, heroRes.data.highlighted_word, heroRes.data.highlighted_word_ar),
        subtitle: pickByLocale(isArabic, heroRes.data.subtitle, heroRes.data.subtitle_ar),
      }
    : null;

  const mockups = {} as Record<MockupSlotKey, string | null>;
  for (const slot of MOCKUP_SLOTS) {
    mockups[slot] = media[slot] ?? null;
  }

  const pickPlan = (plan: PricingPlan | null): PricingPlan | null => {
    if (!plan) return null;
    return {
      ...plan,
      badge: pickByLocale(isArabic, plan.badge, plan.badge_ar) ?? plan.badge,
      features: pickByLocale(isArabic, plan.features, plan.features_ar) ?? plan.features,
      whatsapp_message: pickByLocale(isArabic, plan.whatsapp_message, plan.whatsapp_message_ar) ?? plan.whatsapp_message,
    };
  };

  const designerCard: DesignerCard | null = designerRes.data
    ? {
        ...designerRes.data,
        role: pickByLocale(isArabic, designerRes.data.role, designerRes.data.role_ar),
        bio: pickByLocale(isArabic, designerRes.data.bio, designerRes.data.bio_ar),
      }
    : null;

  const ownerCompanyCard: OwnerCompanyCard | null = ownerRes.data
    ? {
        ...ownerRes.data,
        subtitle: pickByLocale(isArabic, ownerRes.data.subtitle, ownerRes.data.subtitle_ar),
        description: pickByLocale(isArabic, ownerRes.data.description, ownerRes.data.description_ar),
      }
    : null;

  return {
    hero,
    galleryScreenshots: screenshotsRes.data ?? [],
    mockups,
    features: (featuresRes.data ?? []).map((f) => ({
      ...f,
      title: pickByLocale(isArabic, f.title, f.title_ar),
      description: pickByLocale(isArabic, f.description, f.description_ar),
    })),
    monthlyPlan: pickPlan(plans.find((p) => p.plan_type === "monthly") ?? null),
    annualPlan: pickPlan(plans.find((p) => p.plan_type === "annual") ?? null),
    social,
    settings: {
      whatsappNumber: settingsMap["whatsapp_number"],
      appLink: settingsMap["app_download_url"] ?? settingsMap["app_link"],
      webAppLink: settingsMap["web_app_link"] || "/login",
      gmailAddress: settingsMap["gmail_address"] ?? settingsMap["email"],
      logoUrl: settingsMap["logo_url"],
    },
    designerCard,
    ownerCompanyCard,
  };
}
