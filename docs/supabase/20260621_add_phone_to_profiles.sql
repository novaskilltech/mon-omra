-- Migration: Add phone column to profiles if not exists
-- Date: 2026-06-21

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
