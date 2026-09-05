-- ==========================================================
-- 28_HERO_SIMPLIFY.SQL
-- Simplification du Hero : passage de 2 mockups à 1 seul.
--
-- Changements :
--   1. Suppression des clés 'hero_web_screenshot' et
--      'hero_app_screenshot' de la table landing_media.
--      Elles sont remplacées par 'hero_dashboard' seul.
--   2. La clé 'hero_dashboard' contient désormais l'image
--      unique du Hero (desktop).
--   3. Le slot 'hero_phone' est supprimé de MOCKUP_SLOTS
--      car le Hero n'affiche plus qu'une seule image.
--
-- Pourquoi :
--   Le Hero affichait deux mockups superposés (desktop + phone)
--   qui prenaient trop de place et se chevauchaient.
--   Désormais un seul mockup desktop suffit.
-- ==========================================================

-- Suppression des anciennes clés hero si elles existent
DELETE FROM public.landing_media
WHERE key IN ('hero_web_screenshot', 'hero_app_screenshot', 'hero_phone');

-- Insertion de la clé hero_dashboard si elle n'existe pas
INSERT INTO public.landing_media (key, image_url)
VALUES ('hero_dashboard', '')
ON CONFLICT (key) DO NOTHING;

-- Mettre à jour landing_media si la clé hero_dashboard n'existe pas
-- (la table utilise key UNIQUE, donc ON CONFLICT suffit)
