-- Migration : Ajout des colonnes d'audit Nusuk Hajj et disponibilités d'appel
ALTER TABLE public.hajj_requests 
ADD COLUMN IF NOT EXISTS has_nusuk_account TEXT DEFAULT 'NON',
ADD COLUMN IF NOT EXISTS nusuk_account_year TEXT DEFAULT 'NON_APPLICABLE',
ADD COLUMN IF NOT EXISTS nusuk_account_status TEXT DEFAULT 'NON_VERIFIE',
ADD COLUMN IF NOT EXISTS availability_slots TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

