-- ==========================================================
-- 30_LANDING_AR_TRANSLATIONS.SQL
-- Ajoute les colonnes *_ar (arabe) aux tables de contenu de la
-- landing page pour une édition FR/AR depuis l'admin Presentation.
-- Les colonnes existantes (français) sont conservées telles quelles,
-- aucune donnée existante n'est modifiée.
-- ==========================================================

-- ---------- 1. Hero ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'landing_hero_text' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE public.landing_hero_text ADD COLUMN title_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'landing_hero_text' AND column_name = 'highlighted_word_ar'
  ) THEN
    ALTER TABLE public.landing_hero_text ADD COLUMN highlighted_word_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'landing_hero_text' AND column_name = 'subtitle_ar'
  ) THEN
    ALTER TABLE public.landing_hero_text ADD COLUMN subtitle_ar text;
  END IF;
END $$;

-- Seed arabe (uniquement si encore vide)
update public.landing_hero_text set
  title_ar = 'إدارة تعاونيتك،',
  highlighted_word_ar = 'مبسّطة',
  subtitle_ar = 'دبّر مستنداتك (الفواتير، عروض الأسعار)، وأموالك، وعملاءك، وجميع نشاطاتك من منصة واحدة بسيطة وسهلة.'
where title_ar is null;

-- ---------- 2. Features ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'landing_features' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE public.landing_features ADD COLUMN title_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'landing_features' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE public.landing_features ADD COLUMN description_ar text;
  END IF;
END $$;

update public.landing_features set
  title_ar = 'المستندات (PDF)',
  description_ar = 'أنشئ مستنداتك الرسمية وفواتيرك وتقاريرك بصيغة PDF آمنة، واحفظها وشاركها بسهولة.'
where sort_order = 0 and title_ar is null;

update public.landing_features set
  title_ar = 'المنتجات والكتالوج',
  description_ar = 'دبّر مخزونك، وحدّث كتالوج منتجاتك، وتتبّع مخزونك في الوقت الفعلي.'
where sort_order = 1 and title_ar is null;

update public.landing_features set
  title_ar = 'المالية',
  description_ar = 'تصفّح الوضع المالي لتعاونيتك عبر رسوم بيانية واضحة وتتبّع الإيرادات والنفقات.'
where sort_order = 2 and title_ar is null;

update public.landing_features set
  title_ar = 'العملاء والموردون',
  description_ar = 'ركّز معلومات جهات اتصالك، وتتبّع التفاعلات، وابنِ علاقاتك التجارية بفعالية.'
where sort_order = 3 and title_ar is null;

update public.landing_features set
  title_ar = 'النشاطات والتقارير',
  description_ar = 'خطّط لنشاطاتك، وعيّن المهام، وأنشئ تقارير مفصّلة عن أداء التعاونية.'
where sort_order = 4 and title_ar is null;

update public.landing_features set
  title_ar = 'متعدد اللغات (FR/AR)',
  description_ar = 'واجهة ثنائية اللغة بالفرنسية والعربية لتناسب جميع أعضاء تعاونيتك.'
where sort_order = 5 and title_ar is null;

-- ---------- 3. Pricing plans ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pricing_plans' AND column_name = 'badge_ar'
  ) THEN
    ALTER TABLE public.pricing_plans ADD COLUMN badge_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pricing_plans' AND column_name = 'features_ar'
  ) THEN
    ALTER TABLE public.pricing_plans ADD COLUMN features_ar text[];
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pricing_plans' AND column_name = 'whatsapp_message_ar'
  ) THEN
    ALTER TABLE public.pricing_plans ADD COLUMN whatsapp_message_ar text;
  END IF;
END $$;

update public.pricing_plans set
  badge_ar = 'مرن',
  features_ar = array['وصول كامل إلى جميع الميزات', 'دعم عبر البريد الإلكتروني', 'تحديثات مشمولة'],
  whatsapp_message_ar = 'مرحبًا، أنا مهتم بالاشتراك الشهري في تطبيق تعاونيتي.'
where plan_type = 'monthly' and badge_ar is null;

update public.pricing_plans set
  badge_ar = 'موصى به / شهران مجانًا',
  features_ar = array['كل مزايا الاشتراك الشهري', 'دعم أولوية عبر واتساب', 'تدريب على الإعداد مشمول'],
  whatsapp_message_ar = 'مرحبًا، أنا مهتم بالاشتراك السنوي في تطبيق تعاونيتي.'
where plan_type = 'annual' and badge_ar is null;

-- ---------- 4. Designer card ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'designer_card' AND column_name = 'role_ar'
  ) THEN
    ALTER TABLE public.designer_card ADD COLUMN role_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'designer_card' AND column_name = 'bio_ar'
  ) THEN
    ALTER TABLE public.designer_card ADD COLUMN bio_ar text;
  END IF;
END $$;

update public.designer_card set
  role_ar = 'مصمّم ومطوّر الموقع',
  bio_ar = 'شغوف بإنشاء تجارب ويب أنيقة وعملية، أصمم مواقع تعكس هويتك.'
where role_ar is null;

-- ---------- 5. Owner company card ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'presentation_owner_company' AND column_name = 'subtitle_ar'
  ) THEN
    ALTER TABLE public.presentation_owner_company ADD COLUMN subtitle_ar text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'presentation_owner_company' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE public.presentation_owner_company ADD COLUMN description_ar text;
  END IF;
END $$;

update public.presentation_owner_company set
  subtitle_ar = 'الشركة المالكة للمشروع',
  description_ar = 'الشركة الحاملة لمشروع تطبيق تعاونيتي، المكرّسة لرقمنة التعاونيات.'
where subtitle_ar is null;