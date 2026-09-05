-- ==========================================================
-- 24_PRESENTATION_STORAGE_FIX.SQL
-- Self-contained, idempotent setup for the Presentation CMS.
--
-- WHY THIS EXISTS:
--   Run it ONCE (or any number of times) on the live Supabase project. It
--   guarantees the entire public-presentation data layer is in place:
--     * all landing tables (created if missing)
--     * public read + admin write RLS policies
--     * the `landing-media` storage bucket with SELECT/INSERT/UPDATE/DELETE
--     * default seed rows
--   It is safe to re-run. Earlier failures in 20/21/22 leave the project
--   missing these tables; this file is the one-stop fix.
-- ==========================================================

-- ==========================================================
-- 1. CREATE TABLES IF MISSING
-- ==========================================================

create table if not exists landing_media (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  image_url text not null,
  updated_at timestamptz default now()
);

create table if not exists landing_hero_text (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  highlighted_word text not null,
  subtitle text not null,
  updated_at timestamptz default now()
);

create table if not exists landing_features (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  title text not null,
  description text not null,
  sort_order int default 0
);

create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_type text unique not null check (plan_type in ('monthly','annual')),
  price numeric not null,
  currency text default 'DH',
  badge text,
  features text[] not null,
  whatsapp_message text,
  is_featured boolean default false,
  updated_at timestamptz default now()
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text unique not null check (platform in ('whatsapp','facebook','twitter','email')),
  url text not null
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text,
  created_at timestamptz default now(),
  is_read boolean default false
);

create table if not exists landing_screenshots (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('app','web')),
  image_url text not null,
  title text,
  description text,
  sort_order int default 0
);

create table if not exists landing_content (
  id uuid primary key default gen_random_uuid(),
  section text unique not null,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- ==========================================================
-- 2. TOP-LEVEL TABLE CONFIG + RLS POLICIES
-- ==========================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'landing_media', 'landing_hero_text', 'landing_features',
    'pricing_plans', 'social_links', 'site_settings'
  ]
  loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);

      if not exists (
        select 1 from pg_policies where schemaname='public' and tablename = t and policyname = t || '_public_read'
      ) then
        execute format('create policy %I on public.%I for select using (true)', t || '_public_read', t);
      end if;

      if not exists (
        select 1 from pg_policies where schemaname='public' and tablename = t and policyname = t || '_admin_all'
      ) then
        execute format(
          'create policy %I on public.%I for all using (public.get_auth_role() = ''admin'') with check (public.get_auth_role() = ''admin'')',
          t || '_admin_all', t
        );
      end if;
    end if;
  end loop;
end $$;

-- landing_screenshots
alter table public.landing_screenshots enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='landing_screenshots' and policyname='landing_screenshots_public_read'
  ) then
    create policy landing_screenshots_public_read on public.landing_screenshots for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='landing_screenshots' and policyname='landing_screenshots_admin_all'
  ) then
    create policy landing_screenshots_admin_all on public.landing_screenshots
      for all using (public.get_auth_role() = 'admin') with check (public.get_auth_role() = 'admin');
  end if;
end $$;

-- landing_content
do $$
begin
  if exists (
    select 1 from information_schema.tables where table_schema='public' and table_name='landing_content'
  ) then
    alter table public.landing_content enable row level security;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='landing_content' and policyname='landing_content_public_read'
    ) then
      create policy landing_content_public_read on public.landing_content for select using (true);
    end if;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='landing_content' and policyname='landing_content_admin_all'
    ) then
      create policy landing_content_admin_all on public.landing_content
        for all using (public.get_auth_role() = 'admin') with check (public.get_auth_role() = 'admin');
    end if;
  end if;
end $$;

-- contact_messages: public insert, admin all
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_messages' and policyname='contact_messages_public_insert'
  ) then
    create policy contact_messages_public_insert on public.contact_messages for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_messages' and policyname='contact_messages_admin_all'
  ) then
    create policy contact_messages_admin_all on public.contact_messages
      for all using (public.get_auth_role() = 'admin') with check (public.get_auth_role() = 'admin');
  end if;
end $$;

-- ==========================================================
-- 3. STORAGE BUCKET + POLICIES (SELECT/INSERT/UPDATE/DELETE)
-- ==========================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('landing-media', 'landing-media', true, 5242880)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname = 'Public landing media'
  ) then
    create policy "Public landing media" on storage.objects
      for select using (bucket_id = 'landing-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname = 'Authenticated upload landing media'
  ) then
    create policy "Authenticated upload landing media" on storage.objects
      for insert with check (bucket_id = 'landing-media' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname = 'Authenticated update landing media'
  ) then
    create policy "Authenticated update landing media" on storage.objects
      for update using (bucket_id = 'landing-media' and auth.role() = 'authenticated')
      with check (bucket_id = 'landing-media' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname = 'Authenticated delete landing media'
  ) then
    create policy "Authenticated delete landing media" on storage.objects
      for delete using (bucket_id = 'landing-media' and auth.role() = 'authenticated');
  end if;
end $$;

-- ==========================================================
-- 4. SEED (only fills rows that do not exist yet)
-- ==========================================================

insert into landing_hero_text (title, highlighted_word, subtitle) values
('La gestion de votre coopérative,', 'simplifiée',
 'Gérez vos documents (factures, devis), vos finances, vos clients et toutes vos activités depuis une plateforme unique et intuitive.')
on conflict do nothing;

insert into landing_media (key, image_url) values
('hero_web_screenshot', ''), ('hero_app_screenshot', '')
on conflict (key) do nothing;

insert into landing_features (icon, title, description, sort_order) values
('file-text', 'Documents (PDF)', 'Générez, stockez et partagez facilement vos documents officiels, factures et rapports en format PDF sécurisé.', 0),
('archive', 'Produits & Catalogue', 'Gérez votre inventaire, mettez à jour votre catalogue de produits et suivez vos stocks en temps réel.', 1),
('bar-chart-2', 'Finances', 'Visualisez la santé financière de votre coopérative avec des graphiques clairs et un suivi des revenus et dépenses.', 2),
('users', 'Clients & Fournisseurs', 'Centralisez les informations de vos contacts, suivez les interactions et gérez vos relations commerciales efficacement.', 3),
('activities', 'Activités & Rapports', 'Planifiez vos activités, assignez des tâches et générez des rapports détaillés sur les performances de la coopérative.', 4),
('languages', 'Multi-langue (FR/AR)', 'Interface entièrement bilingue Français et Arabe pour s''adapter à tous les membres de votre coopérative.', 5);

insert into pricing_plans (plan_type, price, currency, badge, features, whatsapp_message, is_featured) values
('monthly', 0, 'DH', 'Flexible',
 array['Accès complet à toutes les fonctionnalités','Support par email','Mises à jour incluses'],
 'Bonjour, je suis intéressé par l''abonnement mensuel Taawonyati.', false),
('annual', 0, 'DH', 'Recommandé / 2 mois offerts',
 array['Tout de l''abonnement mensuel','Support prioritaire WhatsApp','Formation d''onboarding incluse'],
 'Bonjour, je suis intéressé par l''abonnement annuel Taawonyati.', true);

insert into social_links (platform, url) values
('whatsapp', 'https://wa.me/2126XXXXXXX'),
('facebook', 'https://facebook.com/taawonyati'),
('twitter', 'https://twitter.com/taawonyati'),
('email', 'mailto:contact@taawonyati.com');

insert into site_settings (key, value) values
('whatsapp_number', '2126XXXXXXX'),
('app_link', 'https://taawonyati.com/app'),
('web_app_link', '/admin/login')
on conflict (key) do nothing;

-- Ensure the logo row always exists (used to persist the brand logo)
insert into site_settings (key, value) values ('logo_url', '')
on conflict (key) do nothing;
