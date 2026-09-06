"use client";

/* eslint-disable react/no-unescaped-entities */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
import { revalidateLanding } from "@/app/actions/revalidate";
import {
  LANDING_FEATURE_ICONS,
  LANDING_ICON_KEYS,
  type LandingIconKey,
} from "@/lib/landing-icons";
import { MOCKUP_SLOTS, type DesignerCard, type MockupSlotKey } from "@/lib/types";
import { ImageUpload } from "@/components/shared/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  ContactMessage,
  LandingFeature,
  LandingHeroText,
  LandingMedia,
  LandingScreenshot,
  OwnerCompanyCard,
  PricingPlan,
  SiteSetting,
  SocialLink,
} from "@/lib/types";

const MAX_SCREENSHOTS_PER_CATEGORY = 5;

const MOCKUP_LABELS: Record<MockupSlotKey, string> = {
  hero_dashboard: "Hero — Capture Desktop",
  access_web_dashboard: "Section Web — Dashboard",
  access_mobile_home: "Mobile — Écran d'accueil",
  access_mobile_documents: "Mobile — Écran Documents",
  access_mobile_produits: "Mobile — Écran Produits",
  access_mobile_finances: "Mobile — Écran Finances",
  access_mobile_plus: "Mobile — Écran Plus",
};

function findMedia(list: LandingMedia[], key: string): string | null {
  return list.find((m) => m.key === key)?.image_url || null;
}

function settingsMap(list: SiteSetting[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const s of list) m[s.key] = s.value;
  return m;
}

function socialMap(list: SocialLink[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const s of list) m[s.platform] = s.url;
  return m;
}

export function LandingSiteManager({
  media,
  hero,
  features: initialFeatures,
  monthlyPlan,
  annualPlan,
  social: socialRows,
  settings: settingRows,
  messages,
  screenshots: initialScreenshots,
  designerCard: initialDesignerCard,
  ownerCompanyCard: initialOwnerCompanyCard,
}: {
  media: LandingMedia[];
  hero: LandingHeroText | null;
  features: LandingFeature[];
  monthlyPlan: PricingPlan | null;
  annualPlan: PricingPlan | null;
  social: SocialLink[];
  settings: SiteSetting[];
  messages: ContactMessage[];
  screenshots: LandingScreenshot[];
  designerCard: DesignerCard | null;
  ownerCompanyCard: OwnerCompanyCard | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  /* ---- Hero state ---- */
  const [heroTitle, setHeroTitle] = useState(hero?.title ?? "");
  const [heroHighlight, setHeroHighlight] = useState(
    hero?.highlighted_word ?? "simplifiée"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(hero?.subtitle ?? "");
  const [heroId, setHeroId] = useState<string | null>(hero?.id ?? null);
  const [heroShot, setHeroShot] = useState<string | null>(
    findMedia(media, "hero_dashboard")
  );

  /* ---- Features state ---- */
  const [featureRows, setFeatureRows] = useState<
    { id: string | null; icon: string; title: string; description: string }[]
  >(
    initialFeatures.map((f) => ({
      id: f.id,
      icon: f.icon,
      title: f.title,
      description: f.description,
    }))
  );

  /* ---- Plans state ---- */
  const [monthly, setMonthly] = useState({
    price: monthlyPlan?.price ?? 0,
    badge: monthlyPlan?.badge ?? "",
    featuresText: (monthlyPlan?.features ?? []).join("\n"),
    whatsapp_message: monthlyPlan?.whatsapp_message ?? "",
    is_featured: monthlyPlan?.is_featured ?? false,
  });
  const [annual, setAnnual] = useState({
    price: annualPlan?.price ?? 0,
    badge: annualPlan?.badge ?? "",
    featuresText: (annualPlan?.features ?? []).join("\n"),
    whatsapp_message: annualPlan?.whatsapp_message ?? "",
    is_featured: annualPlan?.is_featured ?? true,
  });

  /* ---- Social + Settings state ---- */
  const [social, setSocial] = useState<Record<string, string>>(() =>
    socialMap(socialRows)
  );
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>(
    () => settingsMap(settingRows)
  );

  /* ---- Screenshots state ---- */
  const [screenshots, setScreenshots] = useState<
    { id: string | null; category: "app" | "web"; image_url: string; sort_order: number }[]
  >(
    initialScreenshots.map((s) => ({
      id: s.id,
      category: s.category as "app" | "web",
      image_url: s.image_url,
      sort_order: s.sort_order,
    }))
  );

  /* ---- Mockups state ---- */
  const [mockups, setMockups] = useState<Record<MockupSlotKey, string | null>>(() => {
    const m = {} as Record<MockupSlotKey, string | null>;
    for (const slot of MOCKUP_SLOTS) m[slot] = findMedia(media, slot);
    return m;
  });

  /* ---- Designer card state ---- */
  const [designer, setDesigner] = useState({
    name: initialDesignerCard?.name ?? "",
    role: initialDesignerCard?.role ?? "",
    bio: initialDesignerCard?.bio ?? "",
    avatar_url: initialDesignerCard?.avatar_url ?? null,
    whatsapp_link: initialDesignerCard?.whatsapp_link ?? "",
    email: initialDesignerCard?.email ?? "",
    portfolio_link: initialDesignerCard?.portfolio_link ?? "",
    social_instagram: initialDesignerCard?.social_instagram ?? "",
    social_facebook: initialDesignerCard?.social_facebook ?? "",
    social_twitter: initialDesignerCard?.social_twitter ?? "",
    social_dribbble: initialDesignerCard?.social_dribbble ?? "",
  });

  /* ---- Owner company card state ---- */
  const [societe, setSociete] = useState({
    id: initialOwnerCompanyCard?.id ?? null,
    logo_url: initialOwnerCompanyCard?.logo_url ?? null,
    name: initialOwnerCompanyCard?.name ?? "",
    subtitle: initialOwnerCompanyCard?.subtitle ?? "",
    description: initialOwnerCompanyCard?.description ?? "",
    whatsapp: initialOwnerCompanyCard?.whatsapp ?? "",
    email: initialOwnerCompanyCard?.email ?? "",
    website_url: initialOwnerCompanyCard?.website_url ?? "",
    is_active: initialOwnerCompanyCard?.is_active ?? true,
  });

  // Re-read every presentation table from Supabase and re-sync the local state.
  // This guarantees the dashboard always reflects what is actually persisted
  // (including right after a save and after a page refresh), instead of relying
  // on stale `useState` initializers that never update when the server props
  // change in place.
  async function reloadData() {
    const supabase = createClient();
    const [mediaRes, heroRes, featuresRes, plansRes, socialRes, settingsRes, screenshotsRes] =
      await Promise.all([
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
          .from("landing_screenshots")
          .select("*")
          .order("sort_order", { ascending: true })
          .returns<LandingScreenshot[]>(),
      ]);

    const mediaList = mediaRes.data ?? [];
    const newSettings = settingsMap(settingsRes.data ?? []);
    const newSocial = socialMap(socialRes.data ?? []);
    const plans = plansRes.data ?? [];
    const heroData = heroRes.data;

setHeroTitle(heroData?.title ?? "");
      setHeroHighlight(heroData?.highlighted_word ?? "simplifiée");
      setHeroSubtitle(heroData?.subtitle ?? "");
      setHeroId(heroData?.id ?? null);
      setHeroShot(findMedia(mediaList, "hero_dashboard"));

    setFeatureRows(
      (featuresRes.data ?? []).map((f) => ({
        id: f.id,
        icon: f.icon,
        title: f.title,
        description: f.description,
      }))
    );

    const monthlyP = plans.find((p) => p.plan_type === "monthly");
    const annualP = plans.find((p) => p.plan_type === "annual");
    setMonthly({
      price: monthlyP?.price ?? 0,
      badge: monthlyP?.badge ?? "",
      featuresText: (monthlyP?.features ?? []).join("\n"),
      whatsapp_message: monthlyP?.whatsapp_message ?? "",
      is_featured: monthlyP?.is_featured ?? false,
    });
    setAnnual({
      price: annualP?.price ?? 0,
      badge: annualP?.badge ?? "",
      featuresText: (annualP?.features ?? []).join("\n"),
      whatsapp_message: annualP?.whatsapp_message ?? "",
      is_featured: annualP?.is_featured ?? true,
    });

    setSocial(newSocial);
    setSiteSettings(newSettings);

    setScreenshots(
      (screenshotsRes.data ?? []).map((s) => ({
        id: s.id,
        category: s.category as "app" | "web",
        image_url: s.image_url,
        sort_order: s.sort_order,
      }))
    );

    const newMockups = {} as Record<MockupSlotKey, string | null>;
    for (const slot of MOCKUP_SLOTS) {
      newMockups[slot] = findMedia(mediaList, slot);
    }
    setMockups(newMockups);

    const { data: dc } = await supabase
      .from("designer_card")
      .select("*")
      .limit(1)
      .maybeSingle<DesignerCard>();
    if (dc) {
      setDesigner({
        name: dc.name ?? "",
        role: dc.role ?? "",
        bio: dc.bio ?? "",
        avatar_url: dc.avatar_url ?? null,
        whatsapp_link: dc.whatsapp_link ?? "",
        email: dc.email ?? "",
        portfolio_link: dc.portfolio_link ?? "",
        social_instagram: dc.social_instagram ?? "",
        social_facebook: dc.social_facebook ?? "",
        social_twitter: dc.social_twitter ?? "",
        social_dribbble: dc.social_dribbble ?? "",
      });
    }

    const { data: oc } = await supabase
      .from("presentation_owner_company")
      .select("*")
      .limit(1)
      .maybeSingle<OwnerCompanyCard>();
    if (oc) {
      setSociete({
        id: oc.id,
        logo_url: oc.logo_url ?? null,
        name: oc.name ?? "",
        subtitle: oc.subtitle ?? "",
        description: oc.description ?? "",
        whatsapp: oc.whatsapp ?? "",
        email: oc.email ?? "",
        website_url: oc.website_url ?? "",
        is_active: oc.is_active ?? true,
      });
    }
  }

  /* ===== Save handlers ===== */

  async function saveHero() {
    setBusy("hero");
    const supabase = createClient();
    try {
      const payload = {
        title: heroTitle.trim(),
        highlighted_word: heroHighlight.trim(),
        subtitle: heroSubtitle.trim(),
      };
      if (heroId) {
        const { error } = await supabase
          .from("landing_hero_text")
          .update(payload)
          .eq("id", heroId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("landing_hero_text")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data?.id) setHeroId(data.id);
      }
      for (const [key, url] of [
        ["hero_dashboard", heroShot],
      ] as const) {
        if (url) {
          const { error } = await supabase
            .from("landing_media")
            .upsert({ key, image_url: url }, { onConflict: "key" });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("landing_media")
            .delete()
            .eq("key", key);
          if (error) throw error;
        }
      }
      const { error: logoError } = await supabase
        .from("site_settings")
        .upsert(
          { key: "logo_url", value: siteSettings.logo_url ?? "" },
          { onConflict: "key" }
        );
      if (logoError) throw logoError;
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveFeatures() {
    setBusy("features");
    const supabase = createClient();
    try {
      const { error: delErr } = await supabase
        .from("landing_features")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) throw delErr;
      const { error } = await supabase.from("landing_features").insert(
        featureRows.map((f, i) => ({
          icon: f.icon,
          title: f.title.trim(),
          description: f.description.trim(),
          sort_order: i,
        }))
      );
      if (error) throw error;
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function savePlans() {
    setBusy("plans");
    const supabase = createClient();
    try {
      for (const [plan_type, state] of [
        ["monthly", monthly] as const,
        ["annual", annual] as const,
      ]) {
        const { error } = await supabase.from("pricing_plans").upsert(
          {
            plan_type,
            price: Number(state.price) || 0,
            badge: state.badge.trim() || null,
            features: state.featuresText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            whatsapp_message: state.whatsapp_message.trim() || null,
            is_featured: state.is_featured,
          },
          { onConflict: "plan_type" }
        );
        if (error) throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveSocial() {
    setBusy("social");
    const supabase = createClient();
    try {
      for (const [platform, url] of Object.entries(social)) {
        const { error } = await supabase
          .from("social_links")
          .upsert({ platform, url }, { onConflict: "platform" });
        if (error) throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveSettings() {
    setBusy("settings");
    const supabase = createClient();
    try {
      for (const [key, value] of Object.entries(siteSettings)) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key, value }, { onConflict: "key" });
        if (error) throw error;
      }
      if (!("web_app_link" in siteSettings)) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: "web_app_link", value: "/admin/login" }, { onConflict: "key" });
        if (error) throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveScreenshots() {
    setBusy("screenshots");
    const supabase = createClient();
    try {
      // Delete all existing and re-insert (single source of truth in local state).
      const { error: delErr } = await supabase
        .from("landing_screenshots")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) throw delErr;
      if (screenshots.length > 0) {
        const { error } = await supabase.from("landing_screenshots").insert(
          screenshots.map((s, i) => ({
            category: s.category,
            image_url: s.image_url,
            sort_order: i,
          }))
        );
        if (error) throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveMockups() {
    setBusy("mockups");
    const supabase = createClient();
    try {
      for (const slot of MOCKUP_SLOTS) {
        const url = mockups[slot];
        if (url) {
          const { error } = await supabase
            .from("landing_media")
            .upsert({ key: slot, image_url: url }, { onConflict: "key" });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("landing_media")
            .delete()
            .eq("key", slot);
          if (error) throw error;
        }
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveDesignerCard() {
    setBusy("designer");
    const supabase = createClient();
    try {
      const payload = {
        name: designer.name.trim(),
        role: designer.role.trim(),
        bio: designer.bio.trim(),
        avatar_url: designer.avatar_url || null,
        whatsapp_link: designer.whatsapp_link.trim() || null,
        email: designer.email.trim() || null,
        portfolio_link: designer.portfolio_link.trim() || null,
        social_instagram: designer.social_instagram.trim() || null,
        social_facebook: designer.social_facebook.trim() || null,
        social_twitter: designer.social_twitter.trim() || null,
        social_dribbble: designer.social_dribbble.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (initialDesignerCard?.id) {
        const { error } = await supabase
          .from("designer_card")
          .update(payload)
          .eq("id", initialDesignerCard.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("designer_card")
          .insert(payload);
        if (error) throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  async function saveOwnerCompanyCard() {
    setBusy("societe");
    const supabase = createClient();
    try {
      const payload = {
        id: societe.id,
        logo_url: societe.logo_url || null,
        name: societe.name.trim(),
        subtitle: societe.subtitle.trim(),
        description: societe.description.trim(),
        whatsapp: societe.whatsapp.trim() || null,
        email: societe.email.trim() || null,
        website_url: societe.website_url.trim() || null,
        is_active: societe.is_active,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("presentation_owner_company")
        .upsert(payload, { onConflict: "id" });
      if (error) {
        console.error("[saveOwnerCompanyCard] Supabase error:", error);
        throw error;
      }
      await reloadData();
      router.refresh();
      await revalidateLanding();
      toast.success(t("toasts.saved"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setBusy(null);
    }
  }

  /* ===== Feature helpers ===== */

  function addFeature() {
    setFeatureRows((prev) => [
      ...prev,
      { id: null, icon: "file-text", title: "", description: "" },
    ]);
  }

  function removeFeature(idx: number) {
    setFeatureRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveScreenshotWithinCategory(category: "app" | "web", index: number, direction: -1 | 1) {
    setScreenshots((prev) => {
      const categoryItems = prev.filter((shot) => shot.category === category);
      const from = index;
      const to = index + direction;
      if (to < 0 || to >= categoryItems.length) return prev;

      const reordered = [...categoryItems];
      const [item] = reordered.splice(from, 1);
      reordered.splice(to, 0, item);

      let categoryCursor = 0;
      return prev.map((shot) => {
        if (shot.category !== category) return shot;
        const next = reordered[categoryCursor];
        categoryCursor += 1;
        return { ...next, sort_order: categoryCursor - 1 };
      });
    });
  }

  function updateFeature(
    idx: number,
    field: "icon" | "title" | "description",
    value: string
  ) {
    setFeatureRows((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  }

  /* ===== Message actions ===== */

  async function toggleRead(msg: ContactMessage) {
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !msg.is_read })
      .eq("id", msg.id);
    if (!error) router.refresh();
  }

  async function deleteMessage(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.deleted"));
    router.refresh();
  }

  const isBusy = busy !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            {t("adminSite.title")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("adminSite.subtitle")}
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F5F55] hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("adminSite.openSite")}
        </a>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex-wrap">
          <TabsTrigger value="hero">{t("adminSite.heroTab")}</TabsTrigger>
          <TabsTrigger value="features">
            {t("adminSite.featuresTab")}
          </TabsTrigger>
          <TabsTrigger value="plans">{t("adminSite.pricingTab")}</TabsTrigger>
          <TabsTrigger value="social">{t("adminSite.socialTab")}</TabsTrigger>
          <TabsTrigger value="settings">
            {t("adminSite.settingsTab")}
          </TabsTrigger>
          <TabsTrigger value="screenshots">
            Screenshots
          </TabsTrigger>
          <TabsTrigger value="mockups">
            Mockups
          </TabsTrigger>
<TabsTrigger value="designer">
             Designer
           </TabsTrigger>
           <TabsTrigger value="societe">
             Société
           </TabsTrigger>
           <TabsTrigger value="messages">
            {t("adminSite.messagesTab")}
          </TabsTrigger>
        </TabsList>

        {/* ===== HERO ===== */}
        <TabsContent value="hero">
          <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="w-full max-w-[240px]">
                <p className="mb-2 text-sm font-semibold">Logo du site vitrine</p>
                <ImageUpload
                  kind="landing"
                  value={siteSettings.logo_url ?? null}
                  helperText="Affiché dans l'en-tête, le pied de page et la page de connexion"
                  onChange={(value) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      logo_url: value ?? "",
                    }))
                  }
                />
              </div>
              <div className="flex-1">
                <p className="mb-2 text-sm font-semibold">Aperçu du logo</p>
                <div className="grid min-h-[120px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-[#f9fafb] p-6">
                  {siteSettings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={siteSettings.logo_url}
                      alt="Logo"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                  ) : (
                    <p className="text-center text-xs font-medium text-slate-400">
                      2. Enregistrez pour appliquer le logo sur le site.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <FormField label={t("adminSite.heroTitle")}>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
              />
            </FormField>
            <FormField
              label={t("adminSite.heroHighlight")}
              hint={t("adminSite.heroTitleHelp")}
            >
              <Input
                value={heroHighlight}
                onChange={(e) => setHeroHighlight(e.target.value)}
              />
            </FormField>
            <FormField label={t("adminSite.heroSubtitle")}>
              <Textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={3}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Image Hero (Desktop)
                </p>
                <ImageUpload
                  kind="landing"
                  value={heroShot}
                  onChange={setHeroShot}
                />
              </div>
            </div>
            <div className="pt-2">
              <Button
                onClick={saveHero}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "hero" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("toasts.saved")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== FEATURES ===== */}
        <TabsContent value="features">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t("adminSite.featuresHelp")}
            </p>

            {featureRows.map((f, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-[#f9fafb] p-4 sm:flex-row sm:items-start"
              >
                <div className="w-full sm:w-44">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {t("adminSite.featureIcon")}
                  </p>
                  <Select
                    value={f.icon}
                    onValueChange={(v) => updateFeature(idx, "icon", v)}
                  >
                    <SelectTrigger className="h-10">
                      {(() => {
                        const Icon =
                          LANDING_FEATURE_ICONS[f.icon as LandingIconKey];
                        return (
                          <span className="flex items-center gap-2 text-sm">
                            {Icon && <Icon className="h-4 w-4" />}
                            {f.icon}
                          </span>
                        );
                      })()}
                    </SelectTrigger>
                    <SelectContent>
                      {LANDING_ICON_KEYS.map((key) => {
                        const Icon = LANDING_FEATURE_ICONS[key];
                        return (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {key}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full flex-1">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {t("adminSite.featureTitle")}
                  </p>
                  <Input
                    value={f.title}
                    onChange={(e) =>
                      updateFeature(idx, "title", e.target.value)
                    }
                  />
                </div>
                <div className="w-full flex-1">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {t("adminSite.featureDescription")}
                  </p>
                  <Textarea
                    value={f.description}
                    onChange={(e) =>
                      updateFeature(idx, "description", e.target.value)
                    }
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="mt-auto self-center text-destructive transition-colors hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="mr-1 h-4 w-4" />
                {t("adminSite.addFeature")}
              </Button>
              <Button
                onClick={saveFeatures}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "features" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("adminSite.saveFeatures")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== PLANS ===== */}
        <TabsContent value="plans">
          <div className="grid gap-6 lg:grid-cols-2">
            <PlanCardEditor
              label={t("adminSite.planMonthly")}
              state={monthly}
              setState={setMonthly}
            />
            <PlanCardEditor
              label={t("adminSite.planAnnual")}
              state={annual}
              setState={setAnnual}
              featured
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={savePlans}
              disabled={isBusy}
              className="bg-[#0F5F55] hover:bg-[#0B4A43]"
            >
              {busy === "plans" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("adminSite.savePlans")}
            </Button>
          </div>
        </TabsContent>

        {/* ===== SOCIAL ===== */}
        <TabsContent value="social">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            {(["whatsapp", "facebook", "twitter", "email"] as const).map(
              (platform) => (
                <FormField
                  key={platform}
                  label={t(`adminSite.${platform}`)}
                >
                  <Input
                    value={social[platform] ?? ""}
                    onChange={(e) =>
                      setSocial((prev) => ({
                        ...prev,
                        [platform]: e.target.value,
                      }))
                    }
                  />
                </FormField>
              )
            )}
            <div className="pt-2">
              <Button
                onClick={saveSocial}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "social" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("adminSite.saveSocial")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== SETTINGS ===== */}
        <TabsContent value="settings">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <FormField
              label={t("adminSite.whatsappNumber")}
              hint={t("adminSite.whatsappNumberHint")}
            >
              <Input
                value={siteSettings.whatsapp_number ?? ""}
                onChange={(e) =>
                  setSiteSettings((prev) => ({
                    ...prev,
                    whatsapp_number: e.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label={t("adminSite.appLink")}>
              <Input
                value={siteSettings.app_download_url ?? siteSettings.app_link ?? ""}
                onChange={(e) =>
                  setSiteSettings((prev) => ({
                    ...prev,
                    app_download_url: e.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label={t("adminSite.webAppLink")}>
              <Input
                value={siteSettings.web_app_link ?? "/admin/login"}
                onChange={(e) =>
                  setSiteSettings((prev) => ({
                    ...prev,
                    web_app_link: e.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Adresse Gmail">
              <Input
                value={siteSettings.gmail_address ?? ""}
                onChange={(e) =>
                  setSiteSettings((prev) => ({
                    ...prev,
                    gmail_address: e.target.value,
                  }))
                }
              />
            </FormField>
            <div className="pt-2">
              <Button
                onClick={saveSettings}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "settings" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("adminSite.saveSettings")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== SCREENSHOTS ===== */}
        <TabsContent value="screenshots">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Gérez les captures d'écran affichées sur le site vitrine. Les images de catégorie « app » apparaissent dans la ligne Application Mobile, celles de catégorie « web » dans la ligne Version Web.
            </p>

            {(["app", "web"] as const).map((cat) => (
              <div key={cat} className="rounded-2xl border border-slate-100 bg-[#f9fafb] p-4">
                <h4 className="mb-3 text-sm font-bold text-navy">
                  {cat === "app" ? "Application Mobile" : "Version Web"}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {screenshots
                    .filter((s) => s.category === cat)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((shot, idx) => (
                      <div
                        key={shot.id ?? idx}
                        className="group relative w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="aspect-[9/16] max-h-[180px] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={shot.image_url}
                            alt=""
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <ReplaceShotButton
                          current={shot.image_url}
                          onReplace={(url) => {
                            if (!url) return;
                            setScreenshots((prev) =>
                              prev.map((item) =>
                                item === shot ? { ...item, image_url: url } : item
                              )
                            );
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setScreenshots((prev) =>
                              prev.filter((item) => item !== shot)
                            )
                          }
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveScreenshotWithinCategory(cat, idx, -1)}
                            className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 disabled:opacity-40"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === screenshots.filter((s) => s.category === cat).length - 1}
                            onClick={() => moveScreenshotWithinCategory(cat, idx, 1)}
                            className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 disabled:opacity-40"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                  <ScreenshotUpload
                    category={cat}
                    count={screenshots.filter((s) => s.category === cat).length}
                    onAdd={(url) => {
                      const catCount = screenshots.filter((s) => s.category === cat).length;
                      if (catCount >= MAX_SCREENSHOTS_PER_CATEGORY) return;
                      setScreenshots((prev) => [
                        ...prev,
                        {
                          id: null,
                          category: cat,
                          image_url: url,
                          sort_order: catCount,
                        },
                      ]);
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                onClick={saveScreenshots}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "screenshots" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer les screenshots
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== MOCKUPS ===== */}
        <TabsContent value="mockups">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Gérez les mockups d&apos;écrans affichés sur la page d&apos;accueil et la section &quot;Deux façons d&apos;y accéder&quot;. Chaque slot correspond à un emplacement précis du site.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {(["hero_dashboard"] as const).map((slot) => {
                const label = MOCKUP_LABELS[slot] ?? slot;
                return (
                  <div
                    key={slot}
                    className="rounded-2xl border border-slate-100 bg-[#f9fafb] p-4"
                  >
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      {label}
                    </p>
                    <p className="mb-2 text-[10px] font-mono text-slate-400">
                      {slot}
                    </p>
                    <ImageUpload
                      kind="landing"
                      value={mockups[slot]}
                      onChange={(url) =>
                        setMockups((prev) => ({ ...prev, [slot]: url }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                onClick={saveMockups}
                disabled={isBusy}
                className="bg-[#0F5F55] hover:bg-[#0B4A43]"
              >
                {busy === "mockups" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer les mockups
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== DESIGNER ===== */}
        <TabsContent value="designer">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Form */}
            <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Informations du créateur affichées sur la carte en bas de la page d&apos;accueil.
              </p>

              <FormField label="Nom">
                <Input
                  value={designer.name}
                  onChange={(e) =>
                    setDesigner((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="John Doe"
                />
              </FormField>

              <FormField label="Rôle">
                <Input
                  value={designer.role}
                  onChange={(e) =>
                    setDesigner((p) => ({ ...p, role: e.target.value }))
                  }
                  placeholder="Designer & Développeur du site"
                />
              </FormField>

              <FormField label="Bio">
                <Textarea
                  value={designer.bio}
                  onChange={(e) =>
                    setDesigner((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  placeholder="Description courte..."
                />
              </FormField>

              <div>
                <p className="mb-2 text-sm font-semibold">Photo / Avatar</p>
                <ImageUpload
                  kind="landing"
                  value={designer.avatar_url}
                  helperText="Photo circulaire affichée sur la carte (optionnel)"
                  onChange={(url) =>
                    setDesigner((p) => ({ ...p, avatar_url: url }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="WhatsApp (lien complet)">
                  <Input
                    value={designer.whatsapp_link}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, whatsapp_link: e.target.value }))
                    }
                    placeholder="https://wa.me/2126XXXXXXX"
                  />
                </FormField>
                <FormField label="Email">
                  <Input
                    type="email"
                    value={designer.email}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="designer@example.com"
                  />
                </FormField>
              </div>

              <FormField label="Portfolio / LinkedIn">
                <Input
                  value={designer.portfolio_link}
                  onChange={(e) =>
                    setDesigner((p) => ({ ...p, portfolio_link: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </FormField>

              <p className="text-xs font-semibold text-muted-foreground">
                Réseaux sociaux (optionnel — les icônes vides ne sont pas affichées)
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Instagram">
                  <Input
                    value={designer.social_instagram}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, social_instagram: e.target.value }))
                    }
                    placeholder="https://instagram.com/..."
                  />
                </FormField>
                <FormField label="Facebook">
                  <Input
                    value={designer.social_facebook}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, social_facebook: e.target.value }))
                    }
                    placeholder="https://facebook.com/..."
                  />
                </FormField>
                <FormField label="Twitter / X">
                  <Input
                    value={designer.social_twitter}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, social_twitter: e.target.value }))
                    }
                    placeholder="https://x.com/..."
                  />
                </FormField>
                <FormField label="Dribbble">
                  <Input
                    value={designer.social_dribbble}
                    onChange={(e) =>
                      setDesigner((p) => ({ ...p, social_dribbble: e.target.value }))
                    }
                    placeholder="https://dribbble.com/..."
                  />
                </FormField>
              </div>

              <div className="pt-2">
                <Button
                  onClick={saveDesignerCard}
                  disabled={isBusy}
                  className="bg-[#0F5F55] hover:bg-[#0B4A43]"
                >
                  {busy === "designer" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer la carte
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-muted-foreground">
                Aperçu en direct
              </p>
              <div className="overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-center text-white">
                <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-[#0D9488]/50 bg-[#1B2541] text-[#A8E6DC]">
                  {designer.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={designer.avatar_url}
                      alt={designer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10" aria-hidden>
                      <circle cx="12" cy="8" r="4.5" />
                      <path d="M4.5 20c.8-3.4 3.7-5.5 7.5-5.5s6.7 2.1 7.5 5.5" />
                    </svg>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">
                  {designer.name || "[NOM_DESIGNER]"}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#0D9488]">
                  {designer.role || "[RÔLE]"}
                </p>
                <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-slate-300">
                  {designer.bio || "[Bio]"}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {designer.whatsapp_link && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#0D9488] px-3 py-1.5 text-[11px] font-bold text-white">
                      WhatsApp
                    </span>
                  )}
                  {designer.email && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-100">
                      Email
                    </span>
                  )}
                  {designer.portfolio_link && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-100">
                      Portfolio
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {designer.social_instagram && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-slate-200">IG</span>
                  )}
                  {designer.social_facebook && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-slate-200">FB</span>
                  )}
                  {designer.social_twitter && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-slate-200">X</span>
                  )}
                  {designer.social_dribbble && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-slate-200">Dr</span>
                  )}
                </div>
              </div>
</div>
         </div>
         </TabsContent>

         {/* ===== SOCIÉTÉ ===== */}
         <TabsContent value="societe">
           <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
             {/* Form */}
             <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
               <p className="text-sm text-muted-foreground">
                 Informations de la société propriétaire affichées sur la carte en bas de la page d&apos;accueil.
               </p>

               <div>
                 <p className="mb-2 text-sm font-semibold">Logo / Image</p>
                 <ImageUpload
                   kind="landing"
                   value={societe.logo_url}
                   helperText="Logo de la société (optionnel)"
                   onChange={(url) =>
                     setSociete((p) => ({ ...p, logo_url: url }))
                   }
                 />
               </div>

               <FormField label="Nom de la société">
                 <Input
                   value={societe.name}
                   onChange={(e) =>
                     setSociete((p) => ({ ...p, name: e.target.value }))
                   }
                   placeholder="SARL"
                 />
               </FormField>

               <FormField label="Sous-titre">
                 <Input
                   value={societe.subtitle}
                   onChange={(e) =>
                     setSociete((p) => ({ ...p, subtitle: e.target.value }))
                   }
                   placeholder="ex : Société porteuse du projet"
                 />
               </FormField>

               <FormField label="Description">
                 <Textarea
                   value={societe.description}
                   onChange={(e) =>
                     setSociete((p) => ({ ...p, description: e.target.value }))
                   }
                   rows={3}
                   placeholder="Brève description de la société..."
                 />
               </FormField>

               <div className="grid gap-4 sm:grid-cols-2">
                 <FormField label="WhatsApp (lien complet)">
                   <Input
                     value={societe.whatsapp}
                     onChange={(e) =>
                       setSociete((p) => ({ ...p, whatsapp: e.target.value }))
                     }
                     placeholder="https://wa.me/2126XXXXXXX"
                   />
                 </FormField>
                 <FormField label="Email">
                   <Input
                     type="email"
                     value={societe.email}
                     onChange={(e) =>
                       setSociete((p) => ({ ...p, email: e.target.value }))
                     }
                     placeholder="contact@societe.com"
                   />
                 </FormField>
               </div>

                <FormField label="Site web / Portfolio">
                  <Input
                    value={societe.website_url}
                    onChange={(e) =>
                      setSociete((p) => ({ ...p, website_url: e.target.value }))
                    }
                    placeholder="https://taawoniati.com"
                  />
                </FormField>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={societe.is_active}
                    onCheckedChange={(checked) =>
                      setSociete((p) => ({ ...p, is_active: checked }))
                    }
                  />
                  <span className="text-sm font-semibold">Carte active</span>
                </div>

                <div className="pt-2">
                 <Button
                   onClick={saveOwnerCompanyCard}
                   disabled={isBusy}
                   className="bg-[#0F5F55] hover:bg-[#0B4A43]"
                 >
                   {busy === "societe" && (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   )}
                   Enregistrer la carte Société
                 </Button>
               </div>
             </div>

             {/* Live preview */}
             <div className="rounded-3xl bg-white p-6 shadow-sm">
               <p className="mb-4 text-sm font-semibold text-muted-foreground">
                 Aperçu en direct
               </p>
                <div className="overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-center text-white">
                  <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-[#0D9488]/50 bg-[#1B2541] text-[#A8E6DC]">
                    {societe.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={societe.logo_url}
                        alt={societe.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="4.5" />
                        <path d="M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-white">
                    {societe.name || "[NOM_SOCIETE]"}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#0D9488]">
                    {societe.subtitle || "[SOUS_TITRE]"}
                  </p>
                  <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-slate-300">
                    {societe.description || "[DESCRIPTION]"}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {(societe.whatsapp || societe.email || societe.website_url) && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#0D9488] px-3 py-1.5 text-[11px] font-bold text-white">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </span>
                    )}
                    {societe.email && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-100">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                    {societe.website_url && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-100">
                        <ArrowUpRight className="h-3 w-3" /> Site web
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

         {/* ===== MESSAGES ===== */}
         <TabsContent value="messages">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">{t("adminSite.noMessages")}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {msg.name && (
                          <span className="font-semibold text-navy">
                            {msg.name}
                          </span>
                        )}
                        <span className="font-semibold text-navy">
                          {msg.email}
                        </span>
                        <span className="text-muted-foreground">
                          — {fmtDate(msg.created_at)}
                        </span>
                        {msg.is_read && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                            lu
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {msg.message ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRead(msg)}
                      >
                        {msg.is_read
                          ? t("adminSite.markUnread")
                          : t("adminSite.markRead")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-red-700"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===== Inline sub-component for a single plan editor ===== */

function PlanCardEditor({
  label,
  state,
  setState,
  featured = false,
}: {
  label: string;
  state: {
    price: number;
    badge: string;
    featuresText: string;
    whatsapp_message: string;
    is_featured: boolean;
  };
  setState: React.Dispatch<React.SetStateAction<typeof state>>;
  featured?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-navy">{label}</h3>
        {featured && (
          <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={state.is_featured}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  is_featured: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded"
            />
            {t("adminSite.featured")}
          </label>
        )}
      </div>

      <div className="space-y-3">
        <FormField label={t("adminSite.price")}>
          <Input
            type="number"
            value={state.price}
            onChange={(e) =>
              setState((prev) => ({ ...prev, price: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField label={t("adminSite.badge")}>
          <Input
            placeholder={t("adminSite.badgePlaceholder")}
            value={state.badge}
            onChange={(e) =>
              setState((prev) => ({ ...prev, badge: e.target.value }))
            }
          />
        </FormField>
        <FormField label={t("adminSite.featuresList")}>
          <Textarea
            value={state.featuresText}
            onChange={(e) =>
              setState((prev) => ({ ...prev, featuresText: e.target.value }))
            }
            rows={4}
          />
        </FormField>
        <FormField label={t("adminSite.whatsappMessage")}>
          <Input
            value={state.whatsapp_message}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                whatsapp_message: e.target.value,
              }))
            }
          />
        </FormField>
      </div>
    </div>
  );
}

function ScreenshotUpload({
  category,
  onAdd,
  count,
}: {
  category: "app" | "web";
  onAdd: (url: string) => void;
  count: number;
}) {
  const [value, setValue] = useState<string | null>(null);
  const isFull = count >= MAX_SCREENSHOTS_PER_CATEGORY;

  return (
    <div className="w-[150px]">
      {isFull ? (
        <div className="grid aspect-[16/10] w-full place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500">
          5/5 captures
        </div>
      ) : (
        <ImageUpload
          kind="landing"
          value={value}
          helperText={`${count}/5 - ${
            category === "app" ? "Ajouter une capture mobile" : "Ajouter une capture web"
          }`}
          onChange={(url) => {
            setValue(null);
            if (url) onAdd(url);
          }}
        />
      )}
    </div>
  );
}

// Small floating button that lets an admin replace an existing screenshot.
function ReplaceShotButton({
  current,
  onReplace,
}: {
  current: string;
  onReplace: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useI18n();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? "anonymous";
      const ts = Date.now();
      const path = `landing/${userId}_${ts}.jpg`;
      const res = await supabase.storage
        .from(STORAGE_BUCKETS.LANDING_MEDIA)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (res.error) {
        toast.error(t("toasts.imageUploadError"));
        return;
      }
      const url = supabase.storage
        .from(STORAGE_BUCKETS.LANDING_MEDIA)
        .getPublicUrl(path).data.publicUrl;
      onReplace(url);
      toast.success(t("toasts.imageUploaded"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Remplacer la capture"
        className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-40"
      >
        {uploading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <RefreshCcw className="h-3 w-3" />
        )}
      </button>
    </>
  );
}
