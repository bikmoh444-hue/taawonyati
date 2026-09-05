-- ============================================================
-- 13_add_is_paid_to_documents.sql
-- ============================================================

-- Add is_paid column to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
