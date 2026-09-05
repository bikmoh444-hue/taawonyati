-- ============================================================
-- 13_activities.sql
-- ============================================================

-- 1. Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    image_url TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "activities_cooperative_access" ON public.activities;
CREATE POLICY "activities_cooperative_access" ON public.activities
FOR ALL USING (
    cooperative_id = (SELECT cooperative_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. Storage Bucket for Activity Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity_images', 'activity_images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
DROP POLICY IF EXISTS "Public activity images" ON storage.objects;
CREATE POLICY "Public activity images" ON storage.objects
FOR SELECT USING (bucket_id = 'activity_images');

DROP POLICY IF EXISTS "Authenticated upload activity images" ON storage.objects;
CREATE POLICY "Authenticated upload activity images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'activity_images' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated delete activity images" ON storage.objects;
CREATE POLICY "Authenticated delete activity images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'activity_images' AND auth.role() = 'authenticated'
);
