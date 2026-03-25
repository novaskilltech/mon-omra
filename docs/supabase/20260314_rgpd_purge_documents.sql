-- Ajout de la colonne de purge RGPD
-- Permet de définir une date au-delà de laquelle le document doit être supprimé
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS purge_at TIMESTAMP WITH TIME ZONE;

-- Index pour faciliter les tâches de nettoyage
CREATE INDEX IF NOT EXISTS idx_user_documents_purge_at ON public.user_documents(purge_at);

COMMENT ON COLUMN public.user_documents.purge_at IS 'Date de suppression automatique pour conformité RGPD (minimisation des données).';
