-- Migration: Add is_featured column to groups
-- Date: 2026-08-19

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_api_success BOOLEAN DEFAULT TRUE;
