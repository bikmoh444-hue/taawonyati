-- ==========================================================
-- 23_LANDING_FINAL_CLEANUP.SQL
-- Correctifs non destructifs apres consolidation de /admin/presentation.
-- ==========================================================

insert into public.site_settings (key, value)
values
  ('web_app_link', '/login'),
  ('app_download_url', ''),
  ('gmail_address', 'contact@taawonyati.com'),
  ('logo_url', '')
on conflict (key) do update
set value = case
  when excluded.key = 'web_app_link' then '/login'
  when public.site_settings.value is null or public.site_settings.value = '' then excluded.value
  else public.site_settings.value
end;

update public.landing_hero_text
set
  title = 'La gestion de votre coopérative,',
  highlighted_word = 'simplifiée'
where
  coalesce(title, '') = ''
  or title in ('La gestion de votre cooperative,', 'La gestion de votre coopÃ©rative,')
  or coalesce(highlighted_word, '') = ''
  or highlighted_word in ('simplifiee', 'simplifiÃ©e');

insert into public.landing_hero_text (title, highlighted_word, subtitle)
select
  'La gestion de votre coopérative,',
  'simplifiée',
  'Gérez vos documents, vos finances, vos clients et toutes vos activités depuis une plateforme unique et intuitive.'
where not exists (select 1 from public.landing_hero_text);

update public.social_links
set url = 'mailto:contact@taawonyati.com'
where platform = 'email' and (url is null or url = '');

insert into public.social_links (platform, url)
values
  ('facebook', 'https://facebook.com/taawonyati'),
  ('twitter', 'https://twitter.com/taawonyati'),
  ('email', 'mailto:contact@taawonyati.com')
on conflict (platform) do nothing;
