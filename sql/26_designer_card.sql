-- ==========================================================
-- 26_DESIGNER_CARD.SQL
-- Table singleton `designer_card` pour la carte "Créateur
-- derrière ce site" sur la landing page.
-- Contenu éditable depuis l'admin Presentation.
-- ==========================================================

-- ---------- 1. Table ----------

create table if not exists public.designer_card (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  role          text not null default '',
  bio           text not null default '',
  avatar_url    text,
  whatsapp_link text,
  email         text,
  portfolio_link text,
  social_instagram text,
  social_facebook  text,
  social_twitter   text,
  social_dribbble  text,
  updated_at    timestamptz not null default now()
);

-- ---------- 2. RLS ----------

alter table public.designer_card enable row level security;

-- Lecture publique
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'designer_card'
      and policyname = 'designer_card_public_read'
  ) then
    create policy designer_card_public_read
      on public.designer_card
      for select using (true);
  end if;
end $$;

-- Écriture admin only
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'designer_card'
      and policyname = 'designer_card_admin_all'
  ) then
    create policy designer_card_admin_all
      on public.designer_card
      for all using (public.get_auth_role() = 'admin')
      with check (public.get_auth_role() = 'admin');
  end if;
end $$;

-- ---------- 3. Seed (ligne placeholder unique) ----------

insert into public.designer_card (name, role, bio) values
  (
    '[NOM_DESIGNER]',
    '[ROLE — ex : Designer & Développeur du site]',
    'Passionné par la création d''expériences web élégantes et fonctionnelles, je conçois des sites qui reflètent votre identité.'
  )
on conflict do nothing;
