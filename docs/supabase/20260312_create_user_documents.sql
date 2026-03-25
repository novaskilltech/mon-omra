-- Migration: Create user_documents table and secure it
-- Date: 2026-03-12

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PASSPORT', 'PHOTO', 'RESIDENCE_PERMIT')),
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size <= 5242880), -- 5MB limit
    content_type TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can see their own documents
CREATE POLICY "Users can view their own documents"
ON public.user_documents
FOR SELECT
USING (auth.uid() = user_id);

-- Users can upload their own documents
CREATE POLICY "Users can insert their own documents"
ON public.user_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON public.user_documents
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Enable updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_documents_updated_at
    BEFORE UPDATE ON public.user_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Storage Bucket Configuration (Manual instruction)
-- Note: The 'pelerin-documents' bucket must be created manually in Supabase Dashboard with 'Public' turned OFF.
-- Storage RLS policy for the bucket:
-- Allow SELECT/INSERT/DELETE to authenticated users where (storage.foldername(name))[1] = auth.uid()::text
