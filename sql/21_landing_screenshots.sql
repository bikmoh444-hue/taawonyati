-- ==========================================================
-- 21_LANDING_SCREENSHOTS.SQL
-- Ajoute la table landing_screenshots pour gérer plusieurs
-- captures d'écran par catégorie (app / web) avec ordre.
-- Fix: ajoute la colonne `name` à contact_messages.
-- ==========================================================

-- ---------- 1. Table landing_screenshots ----------

create table if not exists public.landing_screenshots (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('app', 'web')),
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 2. Fix contact_messages: ajouter colonne name ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contact_messages'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.contact_messages ADD COLUMN name text;
  END IF;
END $$;

-- ---------- 3. RLS ----------

ALTER TABLE public.landing_screenshots ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'landing_screenshots'
      AND policyname = 'landing_screenshots_public_read'
  ) THEN
    CREATE POLICY landing_screenshots_public_read
      ON public.landing_screenshots
      FOR SELECT USING (true);
  END IF;
END $$;

-- Écriture admin only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'landing_screenshots'
      AND policyname = 'landing_screenshots_admin_all'
  ) THEN
    CREATE POLICY landing_screenshots_admin_all
      ON public.landing_screenshots
      FOR ALL USING (public.get_auth_role() = 'admin')
      WITH CHECK (public.get_auth_role() = 'admin');
  END IF;
END $$;
