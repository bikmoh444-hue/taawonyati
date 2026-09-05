-- ==========================================================
-- 25_LANDING_MOCKUPS.SQL
-- Ajoute des slots de mockups gérables depuis l'admin dans
-- la table landing_media existante (clé → image_url).
-- Pas de nouvelle table : on réutilise le même schéma key/value
-- déjà utilisé pour hero_web_screenshot / hero_app_screenshot.
--
-- Slots ajoutés :
--   hero_dashboard          – Capture desktop du hero
--   hero_phone              – Capture mobile du hero
--   access_web_dashboard    – Capture desktop section "Version Web"
--   access_mobile_home      – Écran d'accueil mobile
--   access_mobile_documents – Écran documents mobile
--   access_mobile_produits  – Écran produits mobile
--   access_mobile_finances  – Écran finances mobile
--   access_mobile_plus      – Écran "Plus" mobile
-- ==========================================================

-- Seed des slots (upsert : ne écrase pas si déjà présent)
INSERT INTO landing_media (key, image_url) VALUES
  ('hero_dashboard',           ''),
  ('hero_phone',               ''),
  ('access_web_dashboard',     ''),
  ('access_mobile_home',       ''),
  ('access_mobile_documents',  ''),
  ('access_mobile_produits',   ''),
  ('access_mobile_finances',   ''),
  ('access_mobile_plus',       '')
ON CONFLICT (key) DO NOTHING;
