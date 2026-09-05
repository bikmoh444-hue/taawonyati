-- ============================================================
-- 19_ENSURE_ACTIVITIES_RLS.SQL
-- Migration 12 (final_security_hardening) drops ALL RLS policies on all
-- tables but only recreates them for a fixed list that does NOT include
-- `activities`. If 12 is (re)applied after 13, the activities policy is
-- gone: RLS stays enabled with no policy, so every query returns zero
-- rows and PDFs/reports appear empty. This re-asserts the policy.
-- ============================================================

-- 1. Ensure RLS is enabled on the activities table.
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 2. (Re)create the member-access policy (same shape as 13_activities.sql).
DROP POLICY IF EXISTS "activities_cooperative_access" ON public.activities;
CREATE POLICY "activities_cooperative_access" ON public.activities
FOR ALL USING (
    cooperative_id = (SELECT cooperative_id FROM public.profiles WHERE id = auth.uid())
);