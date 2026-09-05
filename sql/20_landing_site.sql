-- ==========================================================
-- 20_LANDING_SITE.SQL
-- Site vitrine "Taawonyati" : contenu dynamique piloté depuis l'admin.
-- Tables publiques en lecture, écriture réservée aux admins.
-- contact_messages : insertion publique (formulaire), lecture/écriture admin.
-- ==========================================================

-- ---------- 1. Tables de contenu ----------

-- Screenshots / visuels du hero et des cartes "Version Web" / "Version Mobile"
create table if not exists landing_media (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, -- 'hero_web_screenshot' | 'hero_app_screenshot'
  image_url text not null,
  updated_at timestamptz default now()
);

-- Textes du hero (titre, mot accentué, sous-titre)
create table if not exists landing_hero_text (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  highlighted_word text not null,
  subtitle text not null,
  updated_at timestamptz default now()
);

-- Les 6 (ou plus) features affichées sur la page Fonctionnalités
create table if not exists landing_features (
  id uuid primary key default gen_random_uuid(),
  icon text not null,       -- clé icône (voir lib/landing-icons.ts)
  title text not null,
  description text not null,
  sort_order int default 0
);

-- Plans tarifaires (mensuel / annuel)
create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_type text unique not null check (plan_type in ('monthly','annual')),
  price numeric not null,
  currency text default 'DH',
  badge text,                  -- ex: 'Flexible', 'Recommandé / 2 mois offerts'
  features text[] not null,    -- liste des avantages
  whatsapp_message text,       -- message pré-rempli pour ce plan
  is_featured boolean default false,
  updated_at timestamptz default now()
);

-- Liens réseaux sociaux / contact
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text unique not null check (platform in ('whatsapp','facebook','twitter','email')),
  url text not null
);

-- Réglages généraux du site vitrine (numéro whatsapp, lien app, lien web app...)
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,   -- 'whatsapp_number' | 'app_link' | 'web_app_link'
  value text not null
);

-- Messages reçus via le formulaire de contact du footer
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text,
  created_at timestamptz default now(),
  is_read boolean default false
);

-- ---------- 2. RLS ----------

-- Lecture publique pour le site vitrine, écriture réservée aux admins.
ALTER TABLE landing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_hero_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- policy générique: contenu lisible par tous, modifiable par les admins
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN ARRAY ARRAY['landing_media', 'landing_hero_text', 'landing_features', 'pricing_plans', 'social_links', 'site_settings']
  LOOP
    EXECUTE format('CREATE POLICY %I_public_read ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY %I_admin_all ON %I FOR ALL USING (public.get_auth_role() = ''admin'')', t, t);
  END LOOP;
END $$;

-- contact_messages : tout visiteur peut déposer un message ; seuls les admins
-- peuvent le lire / le marquer lu / le supprimer.
CREATE POLICY "contact_messages_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_admin_all" ON contact_messages
  FOR ALL USING (public.get_auth_role() = 'admin');

-- ---------- 3. Bucket de stockage pour les screenshots du hero ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('landing-media', 'landing-media', true, 5242880)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage'
      and tablename = 'objects' and policyname = 'Public landing media'
  ) then
    create policy "Public landing media" on storage.objects
      for select using (bucket_id = 'landing-media');
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'storage'
      and tablename = 'objects' and policyname = 'Authenticated upload landing media'
  ) then
    create policy "Authenticated upload landing media" on storage.objects
      for insert with check (bucket_id = 'landing-media' and auth.role() = 'authenticated');
  end if;
end $$;

-- ---------- 4. Seed ----------

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
('web_app_link', '/admin/login');
