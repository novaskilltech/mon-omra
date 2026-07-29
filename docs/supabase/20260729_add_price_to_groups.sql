-- Migration : Ajouter la colonne price à la table groups et group_id à la table registration_requests
ALTER TABLE groups ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NULL;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
