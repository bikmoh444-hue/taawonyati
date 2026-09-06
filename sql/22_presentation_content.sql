-- ==========================================================
-- 22_PRESENTATION_CONTENT.SQL
-- Consolidation du contenu vitrine Taawoniati.
-- Ajoute la table landing_content demandee, durcit landing_screenshots
-- et contact_messages, et corrige les reglages utilises par les CTA.
-- ==========================================================

create table if not exists public.landing_content (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  logo_url text,
  monthly_price numeric default 0,
  monthly_features text[] default array[]::text[],
  yearly_price numeric default 0,
  yearly_features text[] default array[]::text[],
  whatsapp_number text,
  app_download_url text,
  facebook_url text,
  twitter_url text,
  gmail_address text,
  updated_at timestamptz default now()
);

create table if not exists public.landing_screenshots (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('app', 'web')),
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contact_messages'
      and column_name = 'name'
  ) then
    alter table public.contact_messages add column name text;
  end if;
end $$;

alter table public.landing_content enable row level security;
alter table public.landing_screenshots enable row level security;
alter table public.contact_messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'landing_content'
      and policyname = 'landing_content_public_read'
  ) then
    create policy landing_content_public_read
      on public.landing_content
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'landing_content'
      and policyname = 'landing_content_admin_all'
  ) then
    create policy landing_content_admin_all
      on public.landing_content
      for all
      using (public.get_auth_role() = 'admin')
      with check (public.get_auth_role() = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'landing_screenshots'
      and policyname = 'landing_screenshots_public_read'
  ) then
    create policy landing_screenshots_public_read
      on public.landing_screenshots
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'landing_screenshots'
      and policyname = 'landing_screenshots_admin_all'
  ) then
    create policy landing_screenshots_admin_all
      on public.landing_screenshots
      for all
      using (public.get_auth_role() = 'admin')
      with check (public.get_auth_role() = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'contact_messages_public_insert'
  ) then
    create policy contact_messages_public_insert
      on public.contact_messages
      for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'contact_messages_admin_all'
  ) then
    create policy contact_messages_admin_all
      on public.contact_messages
      for all
      using (public.get_auth_role() = 'admin')
      with check (public.get_auth_role() = 'admin');
  end if;
end $$;

insert into public.landing_content (
  hero_title,
  hero_subtitle,
  monthly_price,
  monthly_features,
  yearly_price,
  yearly_features,
  whatsapp_number,
  app_download_url,
  facebook_url,
  twitter_url,
  gmail_address
)
select
  'La gestion de votre cooperative, simplifiee',
  'Gerez vos documents, vos finances, vos clients et toutes vos activites depuis une plateforme unique et intuitive.',
  0,
  array['Acces complet a toutes les fonctionnalites', 'Support par email', 'Mises a jour incluses'],
  0,
  array['Tout de l''abonnement mensuel', 'Support prioritaire WhatsApp', 'Formation d''onboarding incluse'],
  '2126XXXXXXX',
  '',
  'https://facebook.com/taawoniati',
  'https://twitter.com/taawoniati',
'contact@taawoniati.com'
where not exists (select 1 from public.landing_content);

insert into storage.buckets (id, name, public, file_size_limit)
values ('landing-media', 'landing-media', true, 5242880)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public landing media'
  ) then
    create policy "Public landing media"
      on storage.objects
      for select
      using (bucket_id = 'landing-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated upload landing media'
  ) then
    create policy "Authenticated upload landing media"
      on storage.objects
      for insert
      with check (bucket_id = 'landing-media' and auth.role() = 'authenticated');
  end if;
end $$;

insert into public.site_settings (key, value)
values
  ('web_app_link', '/login'),
  ('app_download_url', ''),
  ('gmail_address', 'contact@taawoniati.com'),
  ('logo_url', '')
on conflict (key) do update
set value = case
  when excluded.key = 'web_app_link' then '/login'
  else public.site_settings.value
end;
