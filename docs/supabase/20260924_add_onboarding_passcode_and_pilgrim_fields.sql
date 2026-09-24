-- Migration: Add onboarding passcode and pilgrim profile fields
-- Date: 2026-09-24

-- 1. Profiles additions: address, postal code, city, invoice number
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- 2. Agency settings addition: onboarding passcode (defaults to OMRA2026)
ALTER TABLE public.agency_settings ADD COLUMN IF NOT EXISTS onboarding_passcode TEXT DEFAULT 'OMRA2026';

-- 3. Comments for documentation
COMMENT ON COLUMN public.profiles.address IS 'Physical home street address of the pilgrim';
COMMENT ON COLUMN public.profiles.postal_code IS 'Postal or ZIP code of the pilgrim residence';
COMMENT ON COLUMN public.profiles.city IS 'City of residence of the pilgrim';
COMMENT ON COLUMN public.profiles.invoice_number IS 'Agency invoice number associated with the booking';
COMMENT ON COLUMN public.agency_settings.onboarding_passcode IS 'Configurable secret passcode given to pilgrims after payment to access the self-onboarding portal';
