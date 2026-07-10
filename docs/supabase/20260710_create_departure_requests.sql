-- Migration: Create Departure Requests Table
-- Date: 2026-07-10

CREATE TABLE IF NOT EXISTS public.departure_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilgrim_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL, -- ex: 'octobre', 'decembre'
    during_holidays BOOLEAN, -- NULL sauf si octobre/décembre
    num_people INTEGER NOT NULL DEFAULT 1 CHECK (num_people >= 1),
    already_travelled BOOLEAN NOT NULL DEFAULT FALSE,
    requested_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL, -- Si coché pour tarification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Active RLS
ALTER TABLE public.departure_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can manage their own departure requests"
ON public.departure_requests FOR ALL USING (auth.uid() = pilgrim_id);

CREATE POLICY "Admins can view and manage all departure requests"
ON public.departure_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'AGENCY_ADMIN'))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_departure_requests_pilgrim ON public.departure_requests(pilgrim_id);
