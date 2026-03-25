-- ==========================================
-- FEATURE: Ritual Progress (App Pèlerin)
-- Description: Suivi de l'avancement des rituels (Omra)
-- ==========================================

-- 1. Table de progression
CREATE TABLE public.ritual_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ritual_step TEXT NOT NULL, -- e.g., 'ihram', 'tawaf_1', 'sai_complete'
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un utilisateur ne peut compléter une étape spécifique qu'une seule fois
    UNIQUE(user_id, ritual_step)
);

-- Enable RLS
ALTER TABLE public.ritual_progress ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Un pèlerin peut lire sa propre progression
CREATE POLICY "Pilgrims can view their own progress" 
ON public.ritual_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Un pèlerin peut ajouter/marquer sa propre progression
CREATE POLICY "Pilgrims can insert their own progress" 
ON public.ritual_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Un pèlerin peut supprimer sa propre progression (ex: réinitialiser)
CREATE POLICY "Pilgrims can delete their own progress" 
ON public.ritual_progress 
FOR DELETE 
USING (auth.uid() = user_id);
