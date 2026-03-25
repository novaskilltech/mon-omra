-- Migration: Create Hotels and Rooming structures
-- Date: 2026-03-12

-- 0. Agency Settings
CREATE TABLE IF NOT EXISTS public.agency_settings (
    agency_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pricing_mode VARCHAR(20) DEFAULT 'PER_PERSON' CHECK (pricing_mode IN ('PER_PERSON', 'PER_ROOM')),
    currency VARCHAR(3) DEFAULT 'EUR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agencies can manage their own settings" ON public.agency_settings FOR ALL USING (auth.uid() = agency_id);

-- 1. Hotels Table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES auth.users(id), -- Assuming agency admin is a user
    name TEXT NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('MAKKAH', 'MADINAH', 'JEDDAH')),
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    address TEXT,
    distance_from_haram INTEGER, -- in meters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Rooms Table (Inventory)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_number TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE')),
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Room Assignments (The Rooming List)
CREATE TABLE IF NOT EXISTS public.room_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    pilgrim_id UUID NOT NULL REFERENCES auth.users(id), 
    group_id UUID NOT NULL, -- Logical link to a travel group
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(room_id, pilgrim_id) -- Avoid duplicate assignment in same room
);

-- 4. RLS Policies
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

-- Agency admins can manage their own hotels
CREATE POLICY "Agencies can manage their own hotels"
ON public.hotels FOR ALL USING (auth.uid() = agency_id);

-- Rooms/Assignments visible if linked to agency's hotel
CREATE POLICY "Agencies can manage their own rooms"
ON public.rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.agency_id = auth.uid())
);

CREATE POLICY "Agencies can manage their rooming"
ON public.room_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.rooms r 
        JOIN public.hotels h ON r.hotel_id = h.id 
        WHERE r.id = room_id AND h.agency_id = auth.uid()
    )
);
