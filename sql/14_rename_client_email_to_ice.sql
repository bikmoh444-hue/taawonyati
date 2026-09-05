-- ============================================================
-- 14_rename_client_email_to_ice.sql
-- ============================================================

-- Rename email column to ice in clients table
ALTER TABLE public.clients RENAME COLUMN email TO ice;
