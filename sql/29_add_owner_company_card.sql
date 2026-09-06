-- ==========================================================
-- 29_ADD_OWNER_COMPANY_CARD.sql
-- Table `presentation_owner_company` pour la carte "Société"
-- sur la landing page Taawoniati.
-- Contenu éditable depuis l'admin Presentation.
-- ==========================================================

-- ---------- 1. Table ----------

create table if not exists public.presentation_owner_company (
  id            uuid primary key default gen_random_uuid(),
  logo_url      text,
  name          text not null default '',
  subtitle      text not null default '',
  description   text not null default '',
  whatsapp      text,
  email         text,
  website_url   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- 2. RLS ----------

alter table public.presentation_owner_company enable row level security;

-- Lecture publique
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'presentation_owner_company'
      and policyname = 'presentation_owner_company_public_read'
  ) then
    create policy presentation_owner_company_public_read
      on public.presentation_owner_company
      for select using (true);
  end if;
end $$;

-- Écriture admin only
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'presentation_owner_company'
      and policyname = 'presentation_owner_company_admin_all'
  ) then
    create policy presentation_owner_company_admin_all
      on public.presentation_owner_company
      for all using (public.get_auth_role() = 'admin')
      with check (public.get_auth_role() = 'admin');
  end if;
end $$;

-- ---------- 3. Fonction + Trigger updated_at ----------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'presentation_owner_company_updated_at'
  ) then
    create trigger presentation_owner_company_updated_at
      before update on public.presentation_owner_company
      for each row execute procedure public.update_updated_at_column();
  end if;
end $$;

-- ---------- 4. Seed (ligne placeholder unique) ----------

insert into public.presentation_owner_company (name, subtitle, description, is_active) values
  (
    '[NOM_SOCIETE]',
    '[SOCIÉTÉ — ex : Taawoniati SARL]',
    'Société porteuse du projet Taawoniati, dédiée à la digitalisation des coopératives.',
    true
  )
on conflict do nothing;