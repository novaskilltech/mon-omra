-- Migration: Add flyer_path column to groups if not exists
-- Date: 2026-07-20

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS flyer_path TEXT;
