-- DB SCHEMA PLAN - LOT 2 LOGISTICS
-- Phase: Ready for Build (DoR)

-- 1. FLIGHTS TABLE
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('ALLER', 'RETOUR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FLIGHT SEGMENTS (Multi-stop support)
CREATE TABLE flight_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    flight_number VARCHAR(20) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    departure_airport CHAR(3) NOT NULL,
    arrival_airport CHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sequence_order INTEGER NOT NULL, -- Order of stops
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HOTELS MASTER DATA
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('MAKKAH', 'MADINAH', 'JEDDAH')),
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    address TEXT,
    distance_from_haram INTEGER, -- meters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HOTEL ROOM TYPES & QUOTAS
CREATE TABLE hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE')),
    total_capacity INTEGER NOT NULL, -- Max rooms of this type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. GROUP LOGISTICS ASSIGNMENTS
CREATE TABLE group_logistics (
    group_id UUID PRIMARY KEY REFERENCES groups(id),
    flight_departure_id UUID REFERENCES flights(id),
    flight_return_id UUID REFERENCES flights(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GROUP HOTEL STAYS
CREATE TABLE group_hotel_stays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. GROUP DAILY ACTIVITIES
CREATE TABLE group_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    activity_time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    activity_type VARCHAR(20) CHECK (activity_type IN ('RITUEL', 'ZIYARAT', 'TRANSPORT', 'REPAS', 'REPOS')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. NOTIFICATIONS SYSTEM
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    pilgrim_id UUID REFERENCES pilgrims(id) ON DELETE CASCADE, -- NULL means broadcast to group
    type VARCHAR(20) CHECK (type IN ('INFO', 'URGENT', 'LOGISTICS', 'RITUAL')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ROOM ASSIGNMENTS (Rooming List)
CREATE TABLE room_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    hotel_stay_id UUID NOT NULL REFERENCES group_hotel_stays(id) ON DELETE CASCADE,
    room_number VARCHAR(10),
    room_index INTEGER NOT NULL,
    room_type VARCHAR(20) CHECK (room_type IN ('DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE')),
    pilgrim_id UUID NOT NULL REFERENCES pilgrims(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_stay_id, pilgrim_id)
);

-- RLS POLICIES (Final Mix)
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_segments ENABLE ROW LEVEL SECURITY; -- Fix Genius
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_hotel_stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;

-- Agency Isolation
CREATE POLICY agency_iso_flights ON flights FOR ALL USING (agency_id = auth.uid());

CREATE POLICY agency_iso_segments ON flight_segments FOR ALL 
    USING (flight_id IN (SELECT id FROM flights WHERE agency_id = auth.uid())); -- Fix Genius

CREATE POLICY agency_iso_hotels ON hotels FOR ALL USING (agency_id = auth.uid());

CREATE POLICY agency_iso_room_allot ON hotel_rooms FOR ALL 
    USING (hotel_id IN (SELECT id FROM hotels WHERE agency_id = auth.uid()));

CREATE POLICY agency_iso_stays ON group_hotel_stays FOR ALL 
    USING (group_id IN (SELECT id FROM groups WHERE agency_id = auth.uid())); -- Fix Genius

CREATE POLICY agency_iso_activities ON group_activities FOR ALL 
    USING (group_id IN (SELECT id FROM groups WHERE agency_id = auth.uid()));

CREATE POLICY agency_iso_rooming ON room_assignments FOR ALL 
    USING (group_id IN (SELECT id FROM groups WHERE agency_id = auth.uid()));

-- Pilgrim Reach
CREATE POLICY pilgrim_read_notifications ON notifications 
    FOR SELECT USING (pilgrim_id = auth.uid() OR group_id IN (SELECT group_id FROM pilgrims WHERE id = auth.uid()));

-- 10. FINANCIAL SYSTEM (Payments & Ledger)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id),
    pilgrim_id UUID NOT NULL REFERENCES pilgrims(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    method VARCHAR(20) CHECK (method IN ('CASH', 'TRANSFER', 'CARD', 'CHECK')),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED')),
    reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY agency_iso_payments ON payments 
    FOR ALL USING (agency_id = auth.uid());

-- 11. ASSISTANCE & INCIDENTS (Module 7.11)
CREATE TABLE assistance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id),
    pilgrim_id UUID NOT NULL REFERENCES pilgrims(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('SANTE', 'BAGAGES', 'GROUPE_PERDU', 'LOGEMENT', 'AUTRE')),
    priority VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'CRITIQUE')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY agency_iso_assistance ON assistance_requests 
    FOR ALL USING (agency_id = auth.uid());

CREATE POLICY pilgrim_iso_assistance ON assistance_requests 
    FOR ALL USING (pilgrim_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_assistance_agency ON assistance_requests(agency_id);
CREATE INDEX idx_assistance_status ON assistance_requests(status);
