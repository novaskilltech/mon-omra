-- Migration: Add flyer_path column to groups if not exists
-- Date: 2026-07-20

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS flyer_path TEXT;

-- Politiques de sécurité (RLS) pour le bucket 'group-flyers'
-- Permet aux utilisateurs authentifiés d'uploader, lire, modifier et supprimer les flyers.

CREATE POLICY "Allow authenticated upload group-flyers" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'group-flyers');

CREATE POLICY "Allow authenticated read group-flyers" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'group-flyers');

CREATE POLICY "Allow authenticated update group-flyers" ON storage.objects
    FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'group-flyers');

CREATE POLICY "Allow authenticated delete group-flyers" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'group-flyers');
