-- Migration: Add has_breakfast column to rooms table
-- Date: 2026-06-21

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_breakfast BOOLEAN DEFAULT FALSE;
