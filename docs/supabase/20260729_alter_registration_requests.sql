-- Migration : Ajouter les colonnes pour les demandes de renseignement
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS is_former_client BOOLEAN DEFAULT FALSE;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS wants_loyalty_benefits BOOLEAN DEFAULT FALSE;
