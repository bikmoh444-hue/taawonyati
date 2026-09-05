-- ==========================================================
-- 27_ADD_MOBILE_FINANCES_SLOT.SQL
-- Ajoute le slot manquant access_mobile_finances dans la
-- table landing_media pour le mockup "Écran Finances" mobile.
-- Idempotent : ne crée rien si le slot existe déjà.
-- ==========================================================

INSERT INTO landing_media (key, image_url)
VALUES ('access_mobile_finances', '')
ON CONFLICT (key) DO NOTHING;
