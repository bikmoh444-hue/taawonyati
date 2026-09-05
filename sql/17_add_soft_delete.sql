-- ============================================================
-- SOFT DELETE / CORBEILLE (Trash) support
-- Adds deleted_at columns to documents and products (nullable).
-- Soft-deleted rows are hidden from normal views and remain
-- recoverable for 30 days before being permanently removed.
-- ============================================================

alter table documents
  add column if not exists deleted_at timestamp with time zone;

alter table products
  add column if not exists deleted_at timestamp with time zone;

-- Indexes to keep the trash listing and the 30-day cleanup fast.
create index if not exists documents_deleted_at_idx on documents (deleted_at);
create index if not exists products_deleted_at_idx on products (deleted_at);

-- ============================================================
-- AUTOMATIC 30-DAY PERMANENT DELETION
-- ============================================================
-- Two server-side options (they run even when the app is closed).
--
-- OPTION A (RECOMMENDED): Scheduled Supabase Edge Function.
--   This repo already uses Edge Functions. A `purge-trash` function
--   (supabase/functions/purge-trash/index.ts) hard-deletes any
--   documents/products whose deleted_at is older than 30 days.
--   Scheduling is declared in supabase/config.toml
--   ([functions.purge-trash] -> schedule = "0 3 * * *", daily 03:00 UTC).
--   Deploy with:
--     supabase functions deploy purge-trash
--     supabase functions schedule purge-trash   # (or via Dashboard: Database > Functions)
--
-- OPTION B: pg_cron (requires the pg_cron extension enabled on the
--   project BEFORE enabling on your supabase plan).
--   create extension if not exists pg_cron;
--   select cron.schedule(
--     'purge-trash-daily',
--     '0 3 * * *',
--     $cron$
--       delete from documents where deleted_at < now() - interval '30 days';
--       delete from products  where deleted_at < now() - interval '30 days';
--     $cron$
--   );
-- ============================================================

