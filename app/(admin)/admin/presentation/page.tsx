import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  DesignerCard,
  LandingMedia,
  LandingHeroText,
  LandingFeature,
  OwnerCompanyCard,
  PricingPlan,
  SocialLink,
  SiteSetting,
  ContactMessage,
  LandingScreenshot,
} from "@/lib/types";
import { LandingSiteManager } from "@/components/admin/presentation/landing-site-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Presentation - Admin Taawoniati",
};

export default async function AdminPresentationPage() {
  await requireAdminUser();
  const supabase = createClient();

  const [
    media,
    heroRes,
    features,
    plans,
    social,
    settings,
    messagesRes,
    screenshotsRes,
    designerRes,
    ownerRes,
  ] = await Promise.all([
    supabase.from("landing_media").select("*").returns<LandingMedia[]>(),
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
    supabase.from("pricing_plans").select("*").returns<PricingPlan[]>(),
    supabase.from("social_links").select("*").returns<SocialLink[]>(),
    supabase.from("site_settings").select("*").returns<SiteSetting[]>(),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ContactMessage[]>(),
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

  const monthlyPlan =
    plans.data?.find((p) => p.plan_type === "monthly") ?? null;
  const annualPlan = plans.data?.find((p) => p.plan_type === "annual") ?? null;

  return (
    <LandingSiteManager
      media={media.data ?? []}
      hero={heroRes.data}
      features={features.data ?? []}
      monthlyPlan={monthlyPlan}
      annualPlan={annualPlan}
      social={social.data ?? []}
      settings={settings.data ?? []}
      messages={messagesRes.data ?? []}
      screenshots={screenshotsRes.data ?? []}
      designerCard={designerRes.data}
      ownerCompanyCard={ownerRes.data}
    />
  );
}
